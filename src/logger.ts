import path from "path";
import pino, { LogDescriptor, StreamEntry } from "pino";
import fs from "fs";
import pretty from "pino-pretty";

let streams: StreamEntry[] = [
  {
    level: "error",
    stream: fs.createWriteStream(path.join(__dirname, "../", "logs/log-error.log")),
  },
  { level: "warn", stream: fs.createWriteStream(path.join(__dirname, "../", "logs/warn.log")) },
];
let level = "info";
let appName = "notifierbr";

if (process.env.NODE_ENV === "dev") {
  appName = "dev-notifierbr";
  streams = [
    ...streams,
    {
      stream: pretty({
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss",
        levelFirst: true,
        ignore: "pid,hostname,monitor",
        messageFormat: (log: LogDescriptor, messageKey, levelLabel) =>
          `${log.monitor} - ${log[messageKey]}`,
      }),
    },
    {
      level: "info",
      stream: fs.createWriteStream(path.join(__dirname, "../", "logs/log-info.log")),
    },
  ];
  level = "debug";
} else {
  streams = [...streams, { stream: process.stdout }];
}

export default pino(
  {
    name: appName,
    level,
  },
  pino.multistream(streams, { dedupe: true }),
);
