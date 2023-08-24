// Libs
import { readFileSync } from "fs";

import * as grpc from "@grpc/grpc-js";
import { Logger } from "winston";

import {
  CreateReq as Check,
  DefaultRes,
  GetRangeReq,
  GetRangeRes,
} from "../proto/cardchecker_pb";
import services from "../proto/cardchecker_grpc_pb";

// Class
class CardcheckerApiModel {
  private static serverAddr = process.env.SERVER_URI!;
  private static creds = grpc.ChannelCredentials.createSsl(
    readFileSync("./certs/ca.pem"),
    readFileSync("./certs/cardchecker-client.pem.key"),
    readFileSync("./certs/cardchecker-client.pem")
  );

  private static client = new services.CardCheckerServiceClient(
    this.serverAddr,
    this.creds
  );

  /**
   * A method to send a check to the server.
   * @param check - A method send a check to the server.
   */
  public static sendCheck(
    logger: Logger,
    check: Check
  ): Promise<DefaultRes | null> {
    logger.info("Sending check to the server...");

    // Create a promise to handle the request and then return it.
    return new Promise<DefaultRes | null>((resolve) => {
      CardcheckerApiModel.client.create(check, (err, res) => {
        if (err) {
          logger.error("Couldn't send the check to the server. " + err);
          return resolve(null);
        }

        logger.info("The check was successfully sent to the server.");
        resolve(res);
      });
    });
  }

  /**
   * A method to get the last check entry from the cardId.
   * @param logger - The logger obj to log the events.
   * @param cardId - The worker's card id to check in the server.
   */
  public static async isThereChecksOnTimeInterval(
    logger: Logger,
    cardId: string
  ): Promise<boolean> {
    // Get the TIME_INTERVAL env to check if there's some entry on these interval.
    const minutesInterval = Number(process.env.TIME_INTERVAL!);
    logger.info(
      `Checking if there's a check within ${minutesInterval} minutes on server...`
    );

    // Calc the date.
    const dateEnd = new Date();
    const dateInit = new Date();
    dateInit.setMinutes(dateEnd.getMinutes() - minutesInterval);

    // Create the body and send the request.
    const body = new GetRangeReq()
      .setCardid(cardId)
      .setDateinit(dateInit.toISOString())
      .setDateend(dateEnd.toISOString());

    // Create a promise to handle the request.
    const res: GetRangeRes | null = await new Promise((resolve) => {
      CardcheckerApiModel.client.getRange(body, (err, res) => {
        if (err) {
          logger.error("Couldn't get the check from the server. " + err);
          return resolve(null);
        }

        logger.info(`Succefully retrieved ${res.getDataList().length} checks.`);
        resolve(res);
      });
    });

    // Return the result to the caller.
    if (res == null) return false;
    if (res.getDataList().length == 0) return false;
    return true;
  }
}

// Code
export default CardcheckerApiModel;
