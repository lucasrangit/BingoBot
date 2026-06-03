const { isMatch } = require('../match.js');

const tests = [
    { transcript: "I heard B 1", cell: "b1", expected: true },
    { transcript: "I heard bee 1", cell: "b1", expected: true },
    { transcript: "I heard be 1", cell: "b1", expected: true },
    { transcript: "I heard b-1", cell: "b1", expected: true },
    { transcript: "I heard b 12", cell: "b1", expected: false },
    { transcript: "I heard B 12", cell: "b12", expected: true },
    { transcript: "I heard eye 3", cell: "i3", expected: true },
    { transcript: "I heard eye-3", cell: "i3", expected: true },
    { transcript: "I heard and 4", cell: "n4", expected: true },
    { transcript: "I heard in 4", cell: "n4", expected: true },
    { transcript: "I heard gee 5", cell: "g5", expected: true },
    { transcript: "I heard oh 2", cell: "o2", expected: true },
    { transcript: "we got a free space", cell: "free", expected: true },
    { transcript: "B11", cell: "b1", expected: false },
    { transcript: "B11", cell: "b11", expected: true },
    { transcript: "climb 1", cell: "b1", expected: false }
];

function runTests() {
    console.log("Running matching logic tests...");
    let failed = 0;
    
    tests.forEach((t, i) => {
        const res = isMatch(t.transcript, t.cell);
        if (res !== t.expected) {
            console.error(`❌ Match Test #${i} Failed: isMatch("${t.transcript}", "${t.cell}") returned ${res}, expected ${t.expected}`);
            failed++;
        } else {
            console.log(`✅ Test #${i} Passed: isMatch("${t.transcript}", "${t.cell}") => ${res}`);
        }
    });

    if (failed === 0) {
        console.log("\n✅ All matching tests passed successfully!");
        process.exit(0);
    } else {
        console.error(`\n❌ Failed ${failed} matching tests!`);
        process.exit(1);
    }
}

runTests();
