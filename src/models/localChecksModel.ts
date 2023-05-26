// Libs
import { readFileSync, writeFileSync } from "fs";

import { Logger } from "winston";

// Types
import { Check, PendingFile } from "../types/types";

// Class
class LocalChecksModel {
  /**
   * A method to get the last check from the provided cardId.
   * @param logger - The logger object;
   * @param cardId - The card ID to search in the file.
   */
  public static getLastCheck(logger: Logger, cardId: string): Check | null {
    logger.info("Getting last local check..");

    // Filter the checks to get only the checks from the provided card id.
    const pendingFile = this.readPendingFile();
    const checksFromCardId = pendingFile.pendingChecks.filter((check) => {
      return true ? check.cardId == cardId : false;
    });

    // Return the last index from the pending cards.
    if (!checksFromCardId.length) return null;

    return checksFromCardId.reverse()[0];
  }

  /**
   * A method to read the pending file.
   * @returns - The content in the pending file.
   */
  public static readPendingFile(): PendingFile {
    return JSON.parse(readFileSync("./data/pending.json").toString("utf-8"));
  }

  /**
   * A method to write in the pending file.
   * @returns - The content in the pending file.
   */
  public static writePendingFile(file: PendingFile): void {
    writeFileSync("./data/pending.json", JSON.stringify(file, null, 4));
  }
}

// Code
export default LocalChecksModel;
