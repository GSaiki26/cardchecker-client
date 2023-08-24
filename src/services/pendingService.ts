// Libs
import { Logger } from "winston";

import LocalChecksModel from "../models/localChecksModel";
import CheckModel from "../models/checkModel";

// Class
class PendingService {
  /**
   * A method to try to send all the pending checks to the server.
   * @param logger
   */
  public static async sendPendingChecks(logger: Logger) {
    logger.info("Try to send the local checks to the server...");

    // Get the pending checks's array.
    const pendingChecks = LocalChecksModel.readlocalChecksFile();
    for (let i = 0; i < pendingChecks.length; i++) {
      const check = new CheckModel(
        pendingChecks[i].cardId,
        new Date(pendingChecks[i].checkDate),
        true
      );

      // Send the check to the server
      check.logger.info(
        `Sending the local check ${check.check.getCheckdate()}...`
      );
      try {
        const wasSendedToServer = await check.saveToServer();
        if (!wasSendedToServer) throw "Not sended.";
        check.RemoveOnLocal();

        check.logger.info("The check was successfully sended to the server.");
      } catch {
        check.logger.error(
          "Couldn't send the check to the server. Stopping sending local checks..."
        );
        break;
      }
    }
  }
}

// Code
export default PendingService;
