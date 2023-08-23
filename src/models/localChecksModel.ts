// Libs
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join as pathJoin } from "path";

import differenceInMinutes from "date-fns/differenceInMinutes";
import { Logger } from "winston";

import { CreateReq as Check } from "../proto/cardchecker_pb";

// Types
import { LocalCheck } from "../types/types";

// Class
class LocalChecksModel {
  private static localChecksPath = pathJoin("./data", "localChecks.json");

  /**
   * A method to check if there's some check within TIME_INTERVAL minutes.
   * @param logger - The logger object;
   * @param cardId - The card ID to search in the file.
   * @returns - True if there's some check within the TIME_INTERVAL.
   */
  public static isThereChecksOnTimeInterval(
    logger: Logger,
    cardId: string
  ): boolean {
    // Get the TIME_INTERVAL env to check if there's some entry on these interval.
    const minutesInterval = Number(process.env.TIME_INTERVAL!);
    logger.info(
      `Checking if there's a check within ${minutesInterval} minutes locally...`
    );

    // Get the local checks file and get all the entries that has the same cardId.
    const localChecks = this.readlocalChecksFile();
    const checks = localChecks.filter((entry) => {
      if (entry.cardId == cardId) return true;
      return false;
    });
    if (!checks.length) return false;

    // Get the last check and compares with the time is valid.
    checks.reverse();
    const checkDate = new Date(checks[0].checkDate);
    if (differenceInMinutes(new Date(), checkDate) <= minutesInterval)
      return true;
    return false;
  }

  /**
   * A method to create the local checks file if not exists.
   */
  public static createLocalChecksFile(): void {
    // Create the local check file with an empty array.
    if (!existsSync(this.localChecksPath)) this.writelocalChecksFile([]);
  }

  /**
   * A method to push a new entry on the local checks.
   */
  public static addCheck(logger: Logger, check: Check): void {
    logger.info("Adding the check to the local storage...");

    // Get the currente local checks file and add it the new entry.
    const localChecks = this.readlocalChecksFile();
    localChecks.push({
      cardId: check.getCardid(),
      checkDate: check.getCheckdate(),
    });

    // Save to the file.
    this.writelocalChecksFile(localChecks);
  }

  /**
   * A method to remove a entry from the local checks.
   */
  public static removeCheck(check: Check): void {
    // Get the currente local checks file and remove the entry.
    const localChecks = this.readlocalChecksFile();
    for (let i = 0; i < localChecks.length; i++) {
      const entry = localChecks[i];
      // Check if the entry is the provided check.
      if (entry.cardId != check.getCardid()) continue;
      if (entry.checkDate != check.getCheckdate()) continue;

      // Remove it from the array.

      localChecks.splice(i, 1);
    }

    // Save to the file.
    console.info(localChecks);
    this.writelocalChecksFile(localChecks);
  }

  /**
   * A method to read the pending file.
   * @returns - The content in the pending file.
   */
  public static readlocalChecksFile(): LocalCheck[] {
    return JSON.parse(readFileSync(this.localChecksPath).toString("utf-8"));
  }

  /**
   * A method to write in the pending file.
   * @returns - The content in the pending file.
   */
  private static writelocalChecksFile(file: LocalCheck[]): void {
    writeFileSync(this.localChecksPath, JSON.stringify(file, null, 4));
  }
}

// Code
export default LocalChecksModel;
