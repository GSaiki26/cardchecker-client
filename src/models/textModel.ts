// Libs
import { readFileSync } from "fs";

// Class
class TextModel {
  public static lang: string = process.env.LANG!;
  private static fileBuff = readFileSync(
    `./src/langs/${TextModel.lang}.json`
  ).toString("utf-8");
  public static file: { [key: string]: string } = JSON.parse(this.fileBuff);
}

// Code
export default TextModel;
