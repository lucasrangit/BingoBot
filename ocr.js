/**
 * Extracts a list of words from an image using Tesseract.js
 * @param {File|Buffer|string} image - The image file, buffer, or path
 * @param {Object} tesseractInstance - The Tesseract instance (dependency injection for easy testing)
 * @returns {Promise<string[]>} List of cleaned words
 */
async function extractBingoWords(image, tesseractInstance) {
    const result = await tesseractInstance.recognize(image, 'eng');
    const found = result.data.text
        .split(/[\s\n]+/)
        .map(w => w.replace(/[^a-zA-Z0-9\-\u00C0-\u024F]/g, ''))
        .filter(w => w.length > 1);
    
    return found;
}

// Export for Node.js environments (unit testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractBingoWords };
} 
// Export to global scope for browser environments
else if (typeof window !== 'undefined') {
    window.extractBingoWords = extractBingoWords;
}
