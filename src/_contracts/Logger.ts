export interface LogOverrides {
  suppress: boolean;
  info(args: any[]): void;
  error(args: any[]): void;
}
