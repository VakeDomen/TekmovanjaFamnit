import { Response } from './response';
export class ErrorResponse extends Response {
	private error?: any;
	constructor(code?: number, message?: string, error?: string) {
		super(code || 500, message || 'Error occured');
		this.error = error;
	}
	setError(error: any): ErrorResponse {
		this.error = error;
		return this;
	}
}