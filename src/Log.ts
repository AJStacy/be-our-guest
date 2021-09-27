import { LogOverrides, LogFunc } from './_contracts';

/**
 * A simple logger that allows the end user to override the
 * logging methods with their own if desired.
 */
export class Log {
  /**
   * Determines if logs to the console should be suppressed.
   */
  private suppress: boolean;

  /**
   * The function to print info logs from the service container.
   */
  private infoFunc: LogFunc;

  /**
   * The function to print error logs from the service container.
   */
  private errorFunc: LogFunc;

  constructor(overrides?: LogOverrides) {
    this.suppress = overrides?.suppress ?? false;

    this.infoFunc =
      overrides?.info ??
      function(...args: unknown[]) {
        console.info(...args);
      };
    this.errorFunc =
      overrides?.error ??
      function(...args: unknown[]) {
        console.error(...args);
      };
  }

  /**
   * Prints an info level log.
   */
  public info(...args: unknown[]): void {
    if (!this.suppress) {
      this.infoFunc(...args);
    }
  }

  /**
   * Prints an error level log.
   */
  public error(...args: unknown[]): void {
    if (!this.suppress) {
      this.errorFunc(...args);
    }
  }
}
