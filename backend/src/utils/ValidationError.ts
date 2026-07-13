export default class ValidationError extends Error {
    public data: any;

    constructor(message: string, data?: any) {
        super(message);
        this.name = "ValidationError";
        this.data = data;
    }
}
