export type LogFunc = (...args: unknown[]) => void;

export interface LogOverrides {
  suppress: boolean;
  info?: LogFunc;
  error?: LogFunc;
}
