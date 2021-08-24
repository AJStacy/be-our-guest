export type Kv<T> = {
  [key: string]: T
};

export type ValueOf<T> = T[keyof T];