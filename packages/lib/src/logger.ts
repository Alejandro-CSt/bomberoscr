import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue"
};

winston.addColors(colors);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "DD-MMMM-YYYY HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `[${info.timestamp}] [${info.level}] ${info.message}${info.meta ? `\n${JSON.stringify(info.meta)}` : ""}`
  )
);

const level = process.env.NODE_ENV === "development" ? "debug" : "http";

const logger = winston.createLogger({
  level,
  levels,
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error"
    }),
    new winston.transports.File({ filename: "logs/all.log" })
  ]
});

export default logger;
