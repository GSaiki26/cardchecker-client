// Libs
import chalk from "chalk";

import CheckModel from "./models/checkModel";
import localChecksModel from "./models/localChecksModel";
import LoggerModel from "./models/loggerModel";
import PendingService from "./services/pendingService";
import SendCheckService from "./services/sendCheckService";

// Data
const logger = LoggerModel.getLogger("SERVER");
let isRunning = false;
chalk.level = 1;

// Functions
function clearConsole(): void {
  // Prepare the console to the next entry.
  console.clear();
  console.info(chalk.yellow("Aguardando cartão..."));
  isRunning = false;
}

async function onData(chunk: Buffer) {
  // Check if already processing some input.
  console.clear();
  if (isRunning) return;
  isRunning = true;

  // Treat the user's input and check if the provided cardId is valid.
  const input = chunk.toString("utf-8").trim();
  logger.info(`The card #${input} was detected.`);
  let check: CheckModel | null = null;
  try {
    // Check if the check is valid.
    check = new CheckModel(input, new Date(), true);
    if (!(await check.isCheckDateValid())) throw "Date not valid.";
  } catch {
    logger.warn("Invalid provided card.");
    await LoggerModel.writeColor(chalk.bgRedBright(" "));
    clearConsole();
    return;
  }

  // Send the check to the server and then try to send the pending checks to the server.
  if (!(await SendCheckService.sendCheck(check))) {
    await LoggerModel.writeColor(chalk.bgYellow(" "));
  } else {
    await LoggerModel.writeColor(chalk.bgGreen(" "));
  }

  await PendingService.sendPendingChecks(logger);
  clearConsole();
}

// Code
logger.info("The software was started.");
localChecksModel.createLocalChecksFile();

process.stdin.on("data", onData);
console.clear();
console.info(chalk.yellow("Aguardando cartão..."));
