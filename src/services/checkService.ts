// Libs
import chalk from "chalk";

import CardcheckerApiModel from "../models/cardcheckerApiModel";
import LocalChecksModel from "../models/localChecksModel";
import LoggerModel from "../models/loggerModel";
import TextModel from "../models/textModel";
import { Logger } from "winston";
import { Check } from "../types/types";

// Class
class CheckService {
  /**
   * A method to send the cardId to the server.
   * @param cardId - The detected card id.
   */
  public static async send(cardId: string): Promise<void> {
    const logger = LoggerModel.getLogger(cardId);

    // Check if the time between checks is valid.
    const isTimeValid = await this.isTimeBetweenChecksValid(logger, cardId);
    if (!isTimeValid) {
      logger.warn("Not sending the check to the server.");
      return;
    }

    // Send the check to the server.
    const check: Check = {
      cardId: cardId,
      checkDate: new Date().toISOString(),
    };
    const sendedCheck = await CardcheckerApiModel.sendCheck(logger, check);

    if (!sendedCheck) {
      this.saveCheckInPending(check);
      return;
    }

    logger.info("The check was successfully sended to the server.");
    LoggerModel.writeColor(chalk.bgGreenBright(" "));
  }

  /**
   * A method to check if the time between checks is valid.
   * @param logger - The logger object to log the events.
   */
  private static async isTimeBetweenChecksValid(
    logger: Logger,
    cardId: string
  ): Promise<boolean> {
    logger.info("Checking if the time between check is valid...");

    // Check if the local and the server last check is valid.
    const localCheck = LocalChecksModel.getLastCheck(logger, cardId);
    const serverCheck = await CardcheckerApiModel.getLastCheckFrom(
      logger,
      cardId
    );

    if (
      !(
        this.isCheckTimeValid(logger, localCheck) &&
        this.isCheckTimeValid(logger, serverCheck)
      )
    ) {
      logger.warn("The time between checks is invalid.");
      LoggerModel.writeColor(chalk.bgRedBright(" "));
      return false;
    }

    return true;
  }

  /**
   * A method to check if the time from the provided check is valid to be sended.
   * @param logger - The logger object to log the events.
   * @param check - The check object to obtain his time and get the diff.
   */
  private static isCheckTimeValid(
    logger: Logger,
    check: Check | null
  ): boolean {
    // Check if the check is defined.
    if (!check) {
      logger.debug("The check was not defined.");
      return true;
    }

    // Get the diff from the last check and now.
    const timeFromCheck = new Date(check.checkDate);
    const diffSeconds = (new Date().getTime() - timeFromCheck.getTime()) / 1000;
    const minutesLimit = process.env.MINUTES_BETWEEN_CHECKS!;

    // Check if the time is valid in a minutes scale.
    if (diffSeconds / 60 < Number(minutesLimit)) {
      logger.warn("The time is not valid.");
      return false;
    }

    logger.info("The time is valid.");
    return true;
  }

  /**
   * A method to write in the pending files.
   * @param check - The check to save in the file.
   */
  private static saveCheckInPending(check: Check): void {
    // The check was not sended, so writean yellow on screen.
    LoggerModel.writeColor(chalk.bgYellowBright(" "));

    // Save the check in the pending file.
    const pendingFile = LocalChecksModel.readPendingFile();
    pendingFile.pendingChecks.push(check);

    LocalChecksModel.writePendingFile(pendingFile);
  }
}

// Code
export default CheckService;
