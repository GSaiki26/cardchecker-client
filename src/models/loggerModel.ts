// Libs
import { setTimeout } from "timers/promises";

import { createLogger, format, Logger, transports } from "winston";

// Data
const { combine, printf, timestamp } = format;

// Class
class LoggerModel {
  /**
   * A method to create a logger.
   * @param owner - The card id from the current process.
   */
  public static getLogger(owner: string): Logger {
    return createLogger({
      transports: [
        new transports.File({
          filename: `/app/data/logs.log`,
          level: process.env.LOGGER_LEVEL!,
        }),
      ],
      format: combine(
        timestamp(),
        printf(
          (info) =>
            `[${info.timestamp}] (${info.level}) ${owner} - ${info.message}`
        )
      ),
    });
  }

  /**
   * A method to write in the console a unique color.
   * @param color - The color to be displayed.
   */
  public static async writeColor(character: string): Promise<void> {
    // Write the color.
    let text = "";
    for (let i = 0; i < 10000; i++) {
      text += character;
    }

    console.info(text);
    await setTimeout(1000 * 3);
  }
}

// Code
export default LoggerModel;
