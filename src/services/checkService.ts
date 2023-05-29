// Libs
import chalk from "chalk";

import CardcheckerApiModel from "../models/cardcheckerApiModel";
import LocalChecksModel from "../models/localChecksModel";
import LoggerModel from "../models/loggerModel";
import { Logger } from "winston";
import { Check } from "../types/types";

// Class
class CheckService {
  /**
   * A method to send the cardId to the server.
   * @param cardId - The detected card id.
   */
  public static async send(check: Check, printColor: boolean = true): Promise<boolean> {
    const logger = LoggerModel.getLogger(check.cardId);

    // Send the check to the server.
    const sendedCheck = await CardcheckerApiModel.sendCheck(logger, check);

    if (!sendedCheck) {
      if (printColor) await LoggerModel.writeColor(chalk.bgYellowBright(" "));
      return false;
    }

    logger.info("The check was successfully sended to the server.");
    if (printColor) await LoggerModel.writeColor(chalk.bgGreenBright(" "));
    return true;
  }

  /**
   * A method to check if the time between checks is valid.
   * @param logger - The logger object to log the events.
   */
  public static async isTimeBetweenChecksValid(
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
      return false;
    }

    logger.info("The time between checks is valid.");
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
  public static saveCheckInPending(check: Check): void {
    // Save the check in the pending file.
    const pendingFile = LocalChecksModel.readPendingFile();
    pendingFile.push(check);

    LocalChecksModel.writePendingFile(pendingFile);
  }
}

// Code
export default CheckService;
