function findGridBounds(image) {
    const width = image.getWidth();
    const height = image.getHeight();

    const rowBrightCount = new Array(height).fill(0);
    const colBrightCount = new Array(width).fill(0);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = Jimp.intToRGBA(image.getPixelColor(x, y));
            const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
            if (luminance > 220) {
                rowBrightCount[y]++;
                colBrightCount[x]++;
            }
        }
    }

    let firstRow = 0, lastRow = height - 1;
    let firstCol = 0, lastCol = width - 1;

    const rowThreshold = Math.floor(width * 0.08);
    const colThreshold = Math.floor(height * 0.08);

    for (let y = 0; y < height; y++) {
        if (rowBrightCount[y] > rowThreshold) {
            firstRow = y;
            break;
        }
    }
    for (let y = height - 1; y >= 0; y--) {
        if (rowBrightCount[y] > rowThreshold) {
            lastRow = y;
            break;
        }
    }
    for (let x = 0; x < width; x++) {
        if (colBrightCount[x] > colThreshold) {
            firstCol = x;
            break;
        }
    }
    for (let x = width - 1; x >= 0; x--) {
        if (colBrightCount[x] > colThreshold) {
            lastCol = x;
            break;
        }
    }

    const pad = 2;
    const x = Math.max(0, firstCol - pad);
    const y = Math.max(0, firstRow - pad);
    const w = Math.min(width - x, (lastCol - firstCol) + 2 * pad);
    const h = Math.min(height - y, (lastRow - firstRow) + 2 * pad);

    return { x, y, width: w, height: h };
}

function findGridBoundsBrowser(img) {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const rowBrightCount = new Array(height).fill(0);
    const colBrightCount = new Array(width).fill(0);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luminance > 220) {
                rowBrightCount[y]++;
                colBrightCount[x]++;
            }
        }
    }

    let firstRow = 0, lastRow = height - 1;
    let firstCol = 0, lastCol = width - 1;

    const rowThreshold = Math.floor(width * 0.08);
    const colThreshold = Math.floor(height * 0.08);

    for (let y = 0; y < height; y++) {
        if (rowBrightCount[y] > rowThreshold) {
            firstRow = y;
            break;
        }
    }
    for (let y = height - 1; y >= 0; y--) {
        if (rowBrightCount[y] > rowThreshold) {
            lastRow = y;
            break;
        }
    }
    for (let x = 0; x < width; x++) {
        if (colBrightCount[x] > colThreshold) {
            firstCol = x;
            break;
        }
    }
    for (let x = width - 1; x >= 0; x--) {
        if (colBrightCount[x] > colThreshold) {
            lastCol = x;
            break;
        }
    }

    const pad = 2;
    const x = Math.max(0, firstCol - pad);
    const y = Math.max(0, firstRow - pad);
    const w = Math.min(width - x, (lastCol - firstCol) + 2 * pad);
    const h = Math.min(height - y, (lastRow - firstRow) + 2 * pad);

    return { x, y, width: w, height: h };
}

// Global Jimp handle for Node environments
let Jimp = null;

/**
 * Extracts a list of words from an image using Tesseract.js by slicing it into a 5x5 grid of cells.
 * This ensures we always get exactly 25 cells to match the input image layout.
 * @param {File|Buffer|string} image - The image file, buffer, or path
 * @param {Object} tesseractInstance - The Tesseract instance (dependency injection for easy testing)
 * @returns {Promise<string[]>} List of cleaned words (exactly 25 items)
 */
async function extractBingoWords(image, tesseractInstance) {
    const isNode = typeof module !== 'undefined' && module.exports;
    const cellsText = [];

    if (isNode) {
        // Node.js environment - use jimp for image cropping
        if (!Jimp) {
            Jimp = require('jimp');
        }
        let jimpImg;
        if (typeof image === 'string') {
            jimpImg = await Jimp.read(image);
        } else if (Buffer.isBuffer(image)) {
            jimpImg = await Jimp.read(image);
        } else {
            throw new Error("Unsupported image input in Node environment");
        }

        // Detect boundaries and crop main image first!
        const bounds = findGridBounds(jimpImg);
        const gridImg = jimpImg.clone().crop(bounds.x, bounds.y, bounds.width, bounds.height);

        const width = gridImg.getWidth();
        const height = gridImg.getHeight();
        const cellWidth = Math.floor(width / 5);
        const cellHeight = Math.floor(height / 5);

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const cropX = col * cellWidth;
                const cropY = row * cellHeight;
                const cropW = cellWidth;
                const cropH = cellHeight;

                const cellImg = gridImg.clone().crop(cropX, cropY, cropW, cropH);

                // Pad the cropped cell with a 15px solid white border all around
                const pad = 15;
                const paddedImg = new Jimp(cropW + 2 * pad, cropH + 2 * pad, 0xFFFFFFFF);
                paddedImg.composite(cellImg, pad, pad);
                
                const buffer = await paddedImg.getBufferAsync(Jimp.MIME_PNG);
                const result = await tesseractInstance.recognize(buffer, 'eng');
                
                const cellWords = result.data.text
                    .split(/[\s\n]+/)
                    .map(w => w.replace(/[^a-zA-Z0-9\-\u00C0-\u024F]/g, ''))
                    .filter(w => w.length > 1);

                const cellText = cellWords.join(' ');
                cellsText.push(cellText);
            }
        }
    } else {
        // Browser environment - use HTML5 Canvas for image cropping
        const imgUrl = typeof image === 'string' ? image : URL.createObjectURL(image);
        
        const img = await new Promise((resolve, reject) => {
            const tempImg = new Image();
            tempImg.onload = () => resolve(tempImg);
            tempImg.onerror = (e) => reject(e);
            tempImg.src = imgUrl;
        });

        // Detect bounds in the browser
        const bounds = findGridBoundsBrowser(img);

        const cellWidth = Math.floor(bounds.width / 5);
        const cellHeight = Math.floor(bounds.height / 5);
        const pad = 15;

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const canvas = document.createElement('canvas');
                canvas.width = cellWidth + 2 * pad;
                canvas.height = cellHeight + 2 * pad;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.drawImage(
                    img,
                    bounds.x + col * cellWidth, bounds.y + row * cellHeight, cellWidth, cellHeight,
                    pad, pad, cellWidth, cellHeight
                );

                const cellDataUrl = canvas.toDataURL('image/png');
                const result = await tesseractInstance.recognize(cellDataUrl, 'eng');

                const cellWords = result.data.text
                    .split(/[\s\n]+/)
                    .map(w => w.replace(/[^a-zA-Z0-9\-\u00C0-\u024F]/g, ''))
                    .filter(w => w.length > 1);

                const cellText = cellWords.join(' ');
                cellsText.push(cellText);
            }
        }

        // Clean up object URL if we created one
        if (typeof image !== 'string') {
            URL.revokeObjectURL(imgUrl);
        }
    }

    return cellsText;
}

// Export for Node.js environments (unit testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractBingoWords };
} 
// Export to global scope for browser environments
else if (typeof window !== 'undefined') {
    window.extractBingoWords = extractBingoWords;
}
