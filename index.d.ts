import text2speech from "./dist/tts";
import speech2text from "./dist/stt";

declare module "yandex-speechkit-promise" {
  export { text2speech, speech2text };
}
