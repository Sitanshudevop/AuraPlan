/**
 * Safe production logger utility
 * Guards console output to avoid unhandled noise in test suites and production.
 */

class Logger {
  private isDevelopment = Boolean(import.meta.env?.DEV);

  public info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // Diagnostic info in dev only
      console.info(`[AuraPlan Info] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.warn(`[AuraPlan Warning] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.error(`[AuraPlan Error] ${message}`, ...args);
    }
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(`[AuraPlan Debug] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
