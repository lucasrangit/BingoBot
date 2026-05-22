# BingoBot
A bot that plays buzzword bingo on a 5x5 grid for you.

Start by importing an image of the bingo card, crop the image to the 5x5 grid, wait for the bot to OCR the card, and manually correct any OCR errors.
Start the microphone input and the bot will automatically highlight the words as they are spoken.

## Running Tests

The application's OCR text extraction logic is decoupled from the DOM and can be tested locally using Node.js.

To run the unit test:

```bash
node tests/ocr.test.js
```

This will execute a test against a mocked Tesseract instance to verify that the text cleaning and extraction logic works properly without needing the real Tesseract engine.
