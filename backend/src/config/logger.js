import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from './index.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${stack || message}${metaStr}`;
  })
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [
  new winston.transports.Console({ format: consoleFormat }),
];

if (!config.isTest) {
  transports.push(
    new DailyRotateFile({
      dirname: path.resolve(config.logging.dir),
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    new DailyRotateFile({
      level: 'error',
      dirname: path.resolve(config.logging.dir),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    })
  );
}

const logger = winston.createLogger({
  level: config.logging.level,
  defaultMeta: { service: 'orchardlease-api' },
  transports,
  exitOnError: false,
});

// Stream adapter for morgan HTTP logging
export const httpStream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
