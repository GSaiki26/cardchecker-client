// Libs
import chalk from "chalk";

import InputService from "./services/inputService";
import LoggerModel from "./models/loggerModel";
import TextModel from "./models/textModel";

// Types
import { Check } from "./types/types";

// Data
const logger = LoggerModel.getLogger("SERVER");
let isRunning = false;

// Events
// Create an event to every time the stdin is used.
process.stdin.on("data", async (chunk: Buffer) => {
  // Check if already processing some input.
  console.clear();
  if (isRunning) return;
  isRunning = true;

  // Treat the user's input.
  const input = chunk.toString("utf-8").trim();
  logger.info(`The card #${input} was detected.`);
  console.info(TextModel.file.CARD_READEN);
  const check: Check = {
    cardId: input,
    checkDate: new Date().toISOString(),
  };

  await InputService.sendCurrentInput(logger, check);
  await InputService.sendPendingChecks(logger);

  console.clear();
  console.info(chalk.yellow(TextModel.file.CARD_WAITING));
  isRunning = false;
});

// Code
chalk.level = 1;

console.clear();
console.info(chalk.yellow(TextModel.file.CARD_WAITING));
