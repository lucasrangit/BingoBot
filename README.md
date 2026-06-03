# BingoBot
A bot that plays bingo on a 5x5 grid for you.

1. Start by importing an image of the bingo card, crop the image to the 5x5 grid, wait for the bot to OCR the card, and manually correct any OCR errors by clicking and holding on the cell.
2. Start the microphone input and the bot will automatically highlight the words as they are spoken.

## Running Tests

The application's logic is decoupled from the DOM and can be tested locally using Node.js.

To run all tests:

```bash
npm test
```
