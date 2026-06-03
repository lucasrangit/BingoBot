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

class BingoSpeechManager {
  constructor(options) {
    this.voiceBtn = options.voiceBtn;
    this.onMatch = options.onMatch;     // callback: onMatch(transcript, word, cell, index)
    this.getWords = options.getWords;   // callback: returns array of { word, cell, index }
    this.onLog = options.onLog || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {}); // callback: onStatusChange(isListening)
    
    this.isListening = false;
    this.recognition = null;
    this.init();
  }

  init() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      if (this.voiceBtn) this.voiceBtn.style.display = 'none';
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStatusChange(true);
      this.onLog("System", "🎤 Microphone Active");
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      this.checkMatches(transcript);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          console.error("Auto-restart failed:", e);
        }
      } else {
        this.onStatusChange(false);
        this.onLog("System", "⏹️ Microphone Inactive");
      }
    };

    if (this.voiceBtn) {
      this.voiceBtn.addEventListener('click', () => {
        this.toggle();
      });
    }
  }

  toggle() {
    if (!this.recognition) return;
    if (this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    } else {
      try {
        this.isListening = true;
        this.recognition.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
        this.isListening = false;
      }
    }
  }

  checkMatches(transcript) {
    const cleanText = transcript.toLowerCase().trim();
    this.onLog("Voice", `Heard: "${transcript}"`);
    
    const items = this.getWords(); // Array of { word, cell, index }
    items.forEach(item => {
      if (isMatch(cleanText, item.word)) {
        this.onMatch(transcript, item.word, item.cell, item.index);
      }
    });
  }
}

// Export for Node.js environments (unit testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isMatch, BingoSpeechManager };
} 
// Export to global scope for browser environments
else if (typeof window !== 'undefined') {
    window.isMatch = isMatch;
    window.BingoSpeechManager = BingoSpeechManager;
}
