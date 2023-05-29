// Libs
import chalk from "chalk";
import { Logger } from "winston";

import CheckService from "./checkService";
import LocalChecksModel from "../models/localChecksModel";
import LoggerModel from "../models/loggerModel";

// Types
import { Check } from "../types/types";

// Class
class InputService {
  /**
   * A method to send the current input.
   * @param input - The user's check.
  */
  public static async sendCurrentInput(logger: Logger, check: Check): Promise<void> {
    // Check if the input is valid.
    const checker = /^.{10}$/;
    if (!checker.test(check.cardId)) {
      logger.warn("Invalid provided card.");
      await LoggerModel.writeColor(chalk.bgRedBright(" "));
      return;
    }

    // Check if the time between checks is valid.
    const isCheckValid = await CheckService.isTimeBetweenChecksValid(logger, check.cardId);
    if (!isCheckValid) {
      logger.warn("Not sending the check to the server.");
      await LoggerModel.writeColor(chalk.bgRedBright(" "));
      return;
    }

    // Try to send only the input. If the check was not sended, save to the pending file.
    if ( !(await CheckService.send(check)) ) CheckService.saveCheckInPending(check);
  }

  /**
   * A method to try to send all the pending checks to the server.
   * @param logger 
   */
  public static async sendPendingChecks(logger: Logger) {
    // Try to send all the pending checks.
    const pendingChecks = LocalChecksModel.readPendingFile();
    const checksNotSended = pendingChecks.filter(async pendingCheck => {
      const wasSended = await CheckService.send(pendingCheck, false);
      if (!wasSended) return true;
    });

    // Save the checks that still couldn\'t be sended to the server.
    LocalChecksModel.writePendingFile(checksNotSended);
  }
}

// Code
export default InputService;
