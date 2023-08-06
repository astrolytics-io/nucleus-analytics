/* eslint-disable  no-console */

export default class Logger {
  private static config: { debug: boolean } | null = null;

  static setConfig(config: { debug: boolean }) {
    Logger.config = config;
  }

  static log(msg: string) {
    if (Logger.config?.debug) {
      console.log(`Nucleus: ${msg}`);
    }
  }

  static warn(msg: string) {
    if (Logger.config?.debug) {
      console.warn(`Nucleus warning: ${msg}`);
    }
  }

  static error(msg: string) {
    if (Logger.config?.debug) {
      console.error(`Nucleus error: ${msg}`);
    }
  }
}
