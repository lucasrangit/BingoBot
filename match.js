function isMatch(transcript, cellWord) {
    // cellWord is already lowercase and trimmed, e.g. "b1", "free", "b12"
    
    // Check if it's a letter-number pattern (e.g. "b1", "i24", "g6")
    const letterNumMatch = cellWord.match(/^([a-z])(\d+)$/);
    if (letterNumMatch) {
        const letter = letterNumMatch[1];
        const num = letterNumMatch[2];
        
        // Define regex for the letter (including common phonetics)
        let letterPattern;
        if (letter === 'b') letterPattern = '(b|bee|be)';
        else if (letter === 'i') letterPattern = '(i|eye)';
        else if (letter === 'n') letterPattern = '(n|and|in|end)';
        else if (letter === 'g') letterPattern = '(g|gee)';
        else if (letter === 'o') letterPattern = '(o|oh|owe)';
        else letterPattern = letter;
        
        // Match the pattern: letter followed by optional spaces/hyphen, followed by the exact number (word boundary or non-digit at the end)
        const regexStr = `\\b${letterPattern}\\s*[-_]?\\s*${num}(?!\\d)`;
        const regex = new RegExp(regexStr, 'i');
        return regex.test(transcript);
    }
    
    // For non-letter-number cells (e.g. "free" or customized text), standard matching
    const cleanTranscript = transcript.toLowerCase();
    const cleanWord = cellWord.toLowerCase();
    
    if (cleanTranscript.includes(cleanWord)) {
        return true;
    }
    
    // Also try stripped comparison for multi-word keywords
    const strippedTranscript = cleanTranscript.replace(/[\s\-_]/g, '');
    const strippedWord = cleanWord.replace(/[\s\-_]/g, '');
    if (strippedWord.length > 0 && strippedTranscript.includes(strippedWord)) {
        return true;
    }
    
    return false;
}

// Export for Node.js environments (unit testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isMatch };
} 
// Export to global scope for browser environments
else if (typeof window !== 'undefined') {
    window.isMatch = isMatch;
}
