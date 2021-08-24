export class ObjectA {

  private myNumber: number;

  constructor(num: number) {
    this.myNumber = num;
  } 

  public returnMyNumber():number {
    return this.myNumber;
  }

}