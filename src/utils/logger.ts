import { addColors, createLogger, format, transports } from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

addColors(colors);

// Format log agar mudah dibaca: [Waktu] [Level]: [Pesan]
const loggerFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.colorize({ all: true }),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

/**
 * Logger Configuration.
 * Menggantikan console.log biasa agar output lebih rapi dan berwarna.
 * Level 'debug' akan aktif hanya di mode development.
 */
export const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format: loggerFormat,
  transports: [new transports.Console()],
});
