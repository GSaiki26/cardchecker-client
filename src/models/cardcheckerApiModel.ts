// Libs
import { readFileSync } from "fs";

import * as grpc from "@grpc/grpc-js";
import { Logger } from "winston";

import messages from "../dynamic/cardchecker_pb";
import services from "../dynamic/cardchecker_grpc_pb";

// Types
import { Check } from "../types/types";

// Class
class CardcheckerApiModel {
  private static serverAddr = process.env.SERVER_URI!;
  private static channelCredentials = grpc.ChannelCredentials.createSsl(
    readFileSync("./certs/ca.pem"),
    readFileSync("./certs/client.pem.key"),
    readFileSync("./certs/client.pem")
  );

  private static client = new services.CardCheckerServiceClient(
    this.serverAddr,
    this.channelCredentials
  );

  /**
   * A method to send a check to the server.
   * @param check - A method send a check to the server.
   */
  public static sendCheck(
    logger: Logger,
    check: Check
  ): Promise<messages.DefaultRes | null> {
    logger.info("Sending check to the server...");

    // Prepare the request.
    const requestBody = new messages.CreateReq()
      .setCardid(check.cardId)
      .setCheckdate(check.checkDate)
      .setSendmail(true);

    // Do the request and return the result.
    return new Promise<messages.DefaultRes | null>((resolve) => {
      CardcheckerApiModel.client.create(requestBody, (err, res) => {
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
   * @param card_id - The worker's card id to check in the server.
   */
  public static async getLastCheckFrom(
    logger: Logger,
    cardId: string
  ): Promise<Check | null> {
    logger.info("Getting the last server check...");

    // Prepare the request.
    const dateInit = new Date();
    const lastCheckRange = process.env.LASTCHECK_RANGE_DAYS!;
    dateInit.setDate(dateInit.getDate() - Number(lastCheckRange));

    const body = new messages.GetRangeReq()
      .setCardid(cardId)
      .setDateinit(dateInit.toISOString())
      .setDateend(new Date().toISOString());

    // Try to do the request.
    const response: messages.GetRangeRes | null = await new Promise(
      (resolve) => {
        CardcheckerApiModel.client.getRange(body, (err, res) => {
          if (err) {
            logger.error("Couldn't get the check from the server. " + err);
            return resolve(null);
          }

          logger.info(
            `Succefully retrieved last ${res.getDataList().length} checks.`
          );
          resolve(res);
        });
      }
    );

    // Return the result to the caller.
    if (!response) return null;

    const check = response.getDataList().reverse()[0];
    return {
      cardId: cardId,
      checkDate: check.getChecktime(),
    };
  }
}

// Code
export default CardcheckerApiModel;
