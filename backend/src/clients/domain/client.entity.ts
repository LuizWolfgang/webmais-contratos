export class Client {
  constructor(
    public readonly id: string,
    public name: string,
    public document: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  updateDetails(name: string, document: string): void {
    this.name = name;
    this.document = document;
  }
}
