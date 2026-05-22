const { extractBingoWords } = require('../ocr.js');
const Tesseract = require('tesseract.js');
const path = require('path');

const test_cases = [
    {
        imagePath: path.join(__dirname, 'google_ai_buzzword_bingo.png'),
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
        imagePath: path.join(__dirname, 'tech_buzzword_bingo_photo.png'),
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
        imagePath: path.join(__dirname, 'tech_buzzword_bingo_photo_bw.png'),
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
    },
    {
        imagePath: path.join(__dirname, 'blue_buzzword_bingo_grid.png'),
        expected: [
            'BUY', 'URL', 'Wiggle Room', 'Circle', 'Ladder Up', 'Pain Points',
            'Pushback', 'Back the Ask', 'Low-Hanging', 'Fruit', 'Move the Needle',
            'Let\'s Unpack', 'Granular', 'High Level', 'Pressure Test',
            'We\'re Aligned', 'Set Expectations', 'Wheelhouse', 'Net-Net', 'Deep Dive'
        ],
        known_missing: []
    },
    {
        imagePath: path.join(__dirname, 'business_buzzword_bingo_classic.jpg'),
        expected: [
            'deliverable', 'category killer', 'rubber meets the road', 'ROI', 'going viral',
            'customer focused', 'phone it in', 'manage expectations', 'perfect storm',
            'hope is not strategy', 'blue sky', 'FREE', 'leave money on the table',
            'square the circle', 'go-to-market', 'strategy', 'client mind-share',
            'under the bus', 'ballpark', 'best practice', 'low-hanging fruit',
            'end of the day', 'sharpen our pencils', 'parking lot', 'knock it out of the park'
        ],
        known_missing: []
    },
    {
        imagePath: path.join(__dirname, 'buzzword_bingo_social_phrases.png'),
        expected: [
            'OK', 'At the end of the Day', 'Turn Around', 'I\'m Not Being Funny But',
            'Going Forward', 'Do You Get Me', 'Cut a Story Short', 'Stand With'
        ],
        known_missing: []
    },
    {
        imagePath: path.join(__dirname, 'business_buzzword_bingo_retro.jpg'),
        expected: [
            'close the loop', 'run with this', 'best practice', 'perfect storm',
            '80-20 rule', 'square the circle', '64000 question', 'ballpark',
            'sharpen our pencils', 'FREE', 'win-win', 'rubber meets the road',
            'swot analysis', 'hope is not a strategy', 'paradigm shift',
            'low hanging fruit', 'plug and play', 'step up to the plate', 'cash cow'
        ],
        known_missing: []
    },
    {
        imagePath: path.join(__dirname, 'classic_buzzword_bingo.jpg'),
        expected: [
            'action item', 'exit strategy', 'synergy', 'learnings', 'best practice',
            'buy in', 'helicopter view', 'proactive', 'blue sky thinking', 'holistic',
            'Free space', 'leadership', 'on the radar', 'low-hanging fruit', 'big picture',
            'value added', 'strategic', 'elevator pitch', 'outside the box', 'can-do attitude',
            'touch base with', 'alignment', 'incentivise'
        ],
        known_missing: []
    },
    {
        imagePath: path.join(__dirname, 'corporate_buzzword_bingo.jpg'),
        expected: [
            'Prioritize', 'Fostering', 'Reach Out', 'Consolidate', 'synergy', 'Culture',
            'Headwinds', 'Alignment', 'FREE', 'Boots on the Ground', 'Current State',
            'Mission', 'Core Value', 'Strategy', 'Leverage', 'Future State', 'In the Red',
            'Big Picture'
        ],
        known_missing: []
    },
    {
        imagePath: path.join(__dirname, 'office_buzzword_bingo.jpg'),
        expected: [
            'Touch base', 'Circle back', 'Leverage', 'holistic approach', 'Agile', 'scalable',
            'Synergy', 'At the end of the day', 'FREE', 'Alignment', 'Think outside', 'win-win',
            'Best practice', 'Action item', 'the box', 'Move the needle', 'deep dive',
            'Optimize', 'Low hanging fruit', 'Seamless', 'paradigm'
        ],
        known_missing: []
    },
    {
        imagePath: path.join(__dirname, 'radial_buzzword_bingo.jpg'),
        expected: [
            'scalable', 'solution', 'Move the needle', 'KPIs', 'OKRs', 'hard stop', 'mute',
            'Reinvent the', 'Deep dive', 'Pain points', 'Core values', 'The report is wrong',
            'Circle back', 'Traction', '4PL', 'Boots on the ground', 'Hit the ground running',
            'Growth strategy', 'You\'re on mute', 'Return on Investment', 'Think outside the box',
            'Lots of moving parts'
        ],
        known_missing: []
    },
    {
        imagePath: path.join(__dirname, 'simple_small_free_space_grid.png'),
        expected: [
            'FREE SPACE', 'message', 'Games Industry', 'culture'
        ],
        known_missing: []
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
