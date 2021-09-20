import { LogOverrides } from './_contracts';

/**
 * A simple logger that allows the end user to override the
 * logging methods with their own if desired.
 */
export class Log {
  /**
   * Optional logging methods to override the defaults.
   */
  private overrides: LogOverrides | undefined;

  constructor(overrides?: LogOverrides) {
    this.overrides = overrides;
  }

  /**
   * Prints an info level log.
   */
  public info(...args: unknown[]): void {
    this.fire('info', args);
  }

  /**
   * Prints an error level log.
   */
  public error(...args: unknown[]): void {
    this.fire('error', ...args);
  }

  /**
   * Prints a log of the given level.
   */
  private fire(level: 'info' | 'error', ...args: unknown[]): void {
    this.overrides?.[level] && this.overrides.suppress !== true
      ? this.overrides[level](args)
      : console[level](...args);
  }
}
