import { Services } from '../Services';

export type Tags = Map<string, string[]>;
export type Callback<Deps extends Registry, Value, Args> = (
  services: Services<Deps>,
  args: Args
) => Promise<Value>;

export interface Registry {
  [key: string]: unknown | TypeConfig;
}

export interface TypeConfig {
  type: unknown;
  args: unknown[];
}

export type DepDef<
  Ds extends Registry,
  Name extends keyof Ds
> = Ds[Name] extends TypeConfig ? Ds[Name]['type'] : Ds[Name];

export type DepArgs<
  Ds extends Registry,
  Name extends keyof Ds
> = Ds[Name] extends TypeConfig ? Ds[Name]['args'] : never;
