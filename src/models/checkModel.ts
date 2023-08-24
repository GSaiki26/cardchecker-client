// Libs
import CardcheckerApiModel from "./cardcheckerApiModel";
import localChecksModel from "./localChecksModel";
import LoggerModel from "./loggerModel";

import { CreateReq as Check } from "../proto/cardchecker_pb";

// Types
import { Logger } from "winston";

// Class
class CheckModel {
  public check: Check;
  public logger: Logger;

  constructor(cardId: string, checkDate: Date, sendMail: boolean = true) {
    // Check if the cardId is valid.
    const checker = /^.{10}$/;
    if (!checker.test(cardId)) throw "Invalid CardId.";

    this.logger = LoggerModel.getLogger(cardId);
    this.check = new Check()
      .setCardid(cardId)
      .setCheckdate(checkDate.toISOString())
      .setSendmail(sendMail);
  }

  /**
   * A method to save the check on the server.
   */
  public async saveToServer(): Promise<boolean> {
    // Call the CardCheckerAPI mode lto add this check on the server.
    if (!(await CardcheckerApiModel.sendCheck(this.logger, this.check)))
      return false;
    return true;
  }

  /**
   * A method to save the check locally.
   */
  public saveToLocal(): void {
    // Call the localChecks model to add this check on the local storage.
    localChecksModel.addCheck(this.logger, this.check);
  }

  /**
   * A method to remove the check from local storage.
   */
  public RemoveOnLocal(): void {
    this.logger.info("Removing the check from the local storage...");

    // Call the localChecks model to remove this check from the local storage.
    localChecksModel.removeCheck(this.check);
  }

  /**
   * A method to check the last entry from the cardId locally and on the server.
   * @retuns - If the time is valid ( without the TIME_INTERVAL) returns true.
   */
  public async isCheckDateValid(): Promise<boolean> {
    // Check if there's a check on the server within the TIME_INTERVAL.
    const hasCheckOnServer = CardcheckerApiModel.isThereChecksOnTimeInterval(
      this.logger,
      this.check.getCardid()
    );

    // Check if there's a check on the local storage within the TIME_INTERVAL.
    const hasCheckOnLocal = localChecksModel.isThereChecksOnTimeInterval(
      this.logger,
      this.check.getCardid()
    );

    // Check the results.
    if (hasCheckOnLocal) {
      this.logger.warn(
        "A check already is saved locally within the time interval."
      );
      return false;
    }
    if (await hasCheckOnServer) {
      this.logger.warn(
        "A check already is saved remotely within the time interval."
      );
      return false;
    }

    return true;
  }
}

// Code
export default CheckModel;
