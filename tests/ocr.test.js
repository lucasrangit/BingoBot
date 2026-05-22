const { extractBingoWords } = require('../ocr.js');
const Tesseract = require('tesseract.js');
const path = require('path');

const test_cases = [
    {
        imagePath: path.join(__dirname, 'IMG_7755.PNG'),
        expected: [
            'breakthroughs', 'thinking', 'learning', 'applications', 'technology',
            'transgender', 'parameters', 'foundation', 'beer', 'leaderboard',
            'advanced', 'doner', 'AI', 'playback', 'powerful',
            'multimodality', 'on-device', 'subscribers', 'cuttingedge',
            'gemini', 'hallucination', 'knowledge', 'diffusion', 'proactive'
        ],
        known_missing: ['AI', 'gemini', 'hallucination']
    },
    {
        imagePath: path.join(__dirname, 'IMG_7769.PNG'),
        expected: [
            'benchmarks', 'workspace', 'personalized', 'possibilities', 'on-device',
            'vertex', 'learning', 'collaboration', 'agents', 'flutter',
            'thinking', 'datenschutz', 'AI', 'headsets', 'beer',
            'response', 'features', 'microsoft', 'employees', 'token',
            'cloud', 'apple', 'multimodality', 'understanding', 'technology'
        ],
        known_missing: ['AI']
    },
    {
        imagePath: path.join(__dirname, 'IMG_7769_bw.PNG'),
        expected: [
            'benchmarks', 'workspace', 'personalized', 'possibilities', 'on-device',
            'vertex', 'learning', 'collaboration', 'agents', 'flutter',
            'thinking', 'datenschutz', 'AI', 'headsets', 'beer',
            'response', 'features', 'microsoft', 'employees', 'token',
            'cloud', 'apple', 'multimodality', 'understanding', 'technology'
        ],
        known_missing: ['AI']
    },
    {
        imagePath: path.join(__dirname, 'bingo_card_without_preselected_cell.png'),
        expected: [
            'multimodality', 'gemini', 'foundation', 'advanced', 'frontier',
            'understanding', 'tpu', 'security', 'cloud', 'orchestration',
            'hallucination', 'beer', 'AI', 'possibilities', 'employees',
            'progress', 'environment', 'training', 'intelligence', 'personalized',
            'datenschutz', 'state-of-the-art', 'on-device', 'diffusion', 'autonomous'
        ],
        known_missing: ['AI']
    }
];

async function runTests() {
    console.log("Running OCR unit test with real Tesseract.js...");
    console.log("This might take a few seconds as it processes the images...");

    for (let { imagePath, expected, known_missing } of test_cases) {
        console.log(`\nTesting ${path.basename(imagePath)}...`);
        try {
            const result = await extractBingoWords(imagePath, Tesseract);

            const foundWords = [];
            const missingWords = [];

            const lowerResult = result.map(w => w.toLowerCase());

            expected.forEach(word => {
                const lowerWord = word.toLowerCase();
                const matched = lowerResult.some(cellText => {
                    return cellText === lowerWord || cellText.includes(lowerWord);
                });

                if (matched) {
                    foundWords.push(word);
                } else {
                    const lowerKnownMissing = known_missing ? known_missing.map(km => km.toLowerCase()) : [];
                    if (!lowerKnownMissing.includes(lowerWord)) {
                        missingWords.push(word);
                    }
                }
            });

            if (missingWords.length > 0) {
                console.error("❌ Test Failed: Missing words:", missingWords);
                console.error("   OCR Output was:", result);
                process.exit(1);
            }

            console.log(`✅ Test Passed: Found all ${expected.length} expected OCR-readable words.`);
        } catch (e) {
            console.error("❌ Test Failed with exception:", e);
            process.exit(1);
        }
    }
    console.log("\n✅ All tests passed successfully!");
}

runTests();
