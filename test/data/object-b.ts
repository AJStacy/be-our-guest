import { ObjectA } from './object-a';

export class ObjectB {
  private objectA: ObjectA;

  private prop: number = 0;

  constructor(objectA: ObjectA) {
    this.objectA = objectA;
  }

  public addNumberToA(num: number): number {
    return num + this.objectA.returnMyNumber();
  }

  public set testProp(prop: number) {
    this.prop = prop;
  }

  public get testProp(): number {
    return this.prop;
  }
}
