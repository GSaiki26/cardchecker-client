// Libs'
import { setTimeout } from "timers/promises";

import chalk from "chalk";

import CheckService from "./services/checkService";
import LoggerModel from "./models/loggerModel";
import TextModel from "./models/textModel";

// Data
const logger = LoggerModel.getLogger("SERVER");

// Events
// Create an event to every time the stdin is used.
process.stdin.on("data", async (chunk: Buffer) => {
  console.clear();
  const input = chunk.toString("utf-8").trim();
  logger.info(`The card #${input} was detected.`);
  console.info(TextModel.file.CARD_READEN);

  // Get the user input and send to the server.
  await CheckService.send(input);
  await setTimeout(1000 * 3);

  console.clear();
  console.info(chalk.yellow(TextModel.file.CARD_WAITING));
});

// Code
chalk.level = 1;

console.clear();
console.info(chalk.yellow(TextModel.file.CARD_WAITING));
