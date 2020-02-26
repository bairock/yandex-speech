/* eslint-disable */

const TTS = require("./dist/tts.js");
const STT = require("./dist/stt.js");

module.exports = { text2speech: TTS.default, speech2text: STT.default };
