// Libs
import CheckModel from "../models/checkModel";

// Class
class SendCheckService {
  public static async sendCheck(check: CheckModel): Promise<boolean> {
    // Send the check to the server.
    const isCheckSaved = await check.saveToServer();
    if (!isCheckSaved) check.saveToLocal();
    return isCheckSaved;
  }
}

// Code
export default SendCheckService;
