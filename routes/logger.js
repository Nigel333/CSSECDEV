const { createLogger, format, transports } = require("winston");
const path = require("path");


const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
);


const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new transports.File({ filename: path.join(__dirname, "logs", "app.log") }), // Logs all info messages
    new transports.File({ filename: path.join(__dirname, "logs", "error.log"), level: "error" }) // Logs only errors
  ]
});


if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: logFormat }));
}

module.exports = logger;
