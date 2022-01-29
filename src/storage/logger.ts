import { ROUTES } from 'server/routes';
import { Request } from 'express-serve-static-core';
import { appendFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

enum STATUS {
  FAIL = 'FAIL',
  SUCCESS = 'SUCCESS',
  VERBOSE = 'VERBOSE',
  ERROR = 'ERROR',
}

if (!existsSync('data')) {
    mkdirSync('data');
}

const LOG_FILE_PATH = `data/log.txt`;

export default class Logger {
  public static arm(route: ROUTES | string, req: Request) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const from = `${ip} ${req.header('user-agent')}`;
    const action = `METHOD ${route} from ${from}`;

    return {
      fail(reason: string, message?: string): void {
        Logger.log(action, STATUS.FAIL, reason, message);
      },
      success(data?: string): void {
        Logger.log(action, STATUS.SUCCESS, data);
      },
    };
  }

  public static getLogs(count?: number): string {
    const data = readFileSync(LOG_FILE_PATH).toString();

    if (count) {
      const lines = data.split('\n');

      return lines.slice(lines.length - count, lines.length).join('\n');
    }

    return data;
  }

  public static action(actionName: string) {
    const action = `ACTION ${actionName}`;
    return {
      verbose(reason: string, data?: string) {
        Logger.log(action, STATUS.VERBOSE, reason, data);
      },
      error(e: Error | string) {
        Logger.handleError(action, e);
      },
    };
  }

  public static verbose(layer: string, message?: string): void {
    Logger.log(layer, STATUS.VERBOSE, '', message);
  }

  private static handleError(layer: string, e: Error | string) {
    const message = typeof e === 'string' ? e : e.message;
    console.error(layer, STATUS.ERROR, e);
    const line = `${new Date().toLocaleString()} ${STATUS.ERROR} ${layer} ${message}\n`;
    appendFileSync(LOG_FILE_PATH, line);
  }

  private static log(layer: string, status: STATUS, reason?: string, message?: string): void {
    let line = `${new Date().toLocaleString()} ${layer}, ${status}${
      (reason && `, ${reason}`) || ''
    }`;
    if (message) {
      line += `, ${message}`;
    }

    line += '\n';

    console.log(line);
    appendFileSync(LOG_FILE_PATH, line);
  }
}
