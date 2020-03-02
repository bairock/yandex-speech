import { request } from "https";
import { stringify } from "querystring";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name, version } = require("../package.json");

type YanexVoices =
  | "oksana"
  | "jane"
  | "omazh"
  | "zahar"
  | "ermil"
  | "silaerkan"
  | "erkanyavas"
  | "alyss"
  | "nick"
  | "alena"
  | "filipp";

export type YandexTTSParams = {
  ssml?: boolean;
  lang?: "ru-RU" | "en-US" | "tr-TR";
  voice?: YanexVoices;
  emotion?: "good" | "neutral" | "evil";
  speed?: number;
  format?: "lpcm" | "oggopus";
  sampleRateHertz?: 48000 | 16000 | 8000;
  folderId?: string;
  auth: string;
};

const apiUrl = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize";

export default async function TTS(
  text: string,
  params: YandexTTSParams
): Promise<Buffer> {
  const options: YandexTTSParams = {
    ssml: false,
    lang: "ru-RU",
    voice: "oksana",
    speed: 1.0,
    format: "oggopus",
    sampleRateHertz: 48000,
    emotion: "neutral",
    ...params
  };

  const textParamName = options.ssml ? "ssml" : "text";
  const stringifiedParams = stringify({
    [textParamName]: text,
    lang: options.lang,
    voice: options.voice,
    speed: options.speed,
    format: options.format,
    sampleRateHertz: options.sampleRateHertz,
    emotion: options.emotion,
    folderId: options.folderId
  });

  return new Promise((resolve, reject) => {
    const req = request(
      apiUrl,
      {
        method: "POST",
        headers: {
          Accept:
            `audio/${options.format}` === "oggopus"
              ? "ogg; codec=opus"
              : "vnd.wave; codec=lpcm",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: options.auth,
          "User-Agent": `${name}/${version}`
        }
      },
      res => {
        let data = "";

        res.setEncoding("binary");

        res.on("data", chunk => {
          // console.log(chunk);
          data += chunk;
        });

        res.on("error", reject);

        res.on("end", () => {
          if (res.statusCode !== 200) {
            const errorJson = Buffer.from(data, "binary").toString("utf8");
            const { error_code: ec, error_message: em } = JSON.parse(errorJson);

            reject(new Error(`${ec}: ${em}`));
          } else {
            resolve(Buffer.from(data, "binary"));
          }
        });
      }
    );

    req.write(stringifiedParams);

    req.end();
  });
}
