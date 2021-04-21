import { request } from "https";
import { stringify } from "querystring";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name, version } = require("../package.json");

export type YandexSTTParams = {
  profanityFilter?: boolean;
  format?: "lpcm" | "oggopus";
  sampleRateHertz?: 48000 | 16000 | 8000;
  folderId?: string;
  auth: string;
  lang?: "ru-RU" | "en-US" | "tr-TR";
  topic?: "general" | "general:rc" | "maps";
}

const apiUrl = "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize";

/**
 * Function to recognize speech to text
 *
 * @param {Buffer} audio
 * @param {YandexSTTParams} params
 *
 * @returns {string} - result of recognition
 *
 * @see https://cloud.yandex.ru/docs/speechkit/stt/request
 */
export default function STT(
  audio: Buffer,
  params: YandexSTTParams
): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: YandexSTTParams = {
      profanityFilter: false,
      lang: "ru-RU",
      topic: "general",
      format: "oggopus",
      sampleRateHertz: 48000,
      ...params,
    };

    const stringifiedParams = stringify(options);

    const req = request(
      `${apiUrl}?${stringifiedParams}`,
      {
        headers: {
          "Content-Type":
            `audio/${options.format}` === "oggopus"
              ? "ogg; codec=opus"
              : "vnd.wave; codec=lpcm",
          Accept: "application/json",
          Authorization: options.auth,
          "User-Agent": `${name}/${version}`,
        },
        method: "POST",
      },
      (res) => {
        res.setEncoding("utf8");

        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("error", reject);

        res.on("end", () => {
          const obj = JSON.parse(data);

          if (obj.result) {
            resolve(obj.result as string);
          } else {
            const { error_code: ec, error_message: em } = obj;

            reject(new Error(`${ec}: ${em}`));
          }
        });
      }
    );

    req.write(audio);
    req.end();
  });
}
