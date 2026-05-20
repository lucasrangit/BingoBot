# BingoBot
A bot that helps you play bingo

## Running Tests

The application's OCR text extraction logic is decoupled from the DOM and can be tested locally using Node.js.

To run the unit test:

```bash
node tests/ocr.test.js
```

This will execute a test against a mocked Tesseract instance to verify that the text cleaning and extraction logic works properly without needing the real Tesseract engine.
