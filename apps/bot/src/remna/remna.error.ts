export class RemnaError extends Error {
  status?: number;
  context?: any;

  constructor(message: string, status?: number, context?: any) {
    super(message);
    this.status = status;
    this.context = context;
  }
}
