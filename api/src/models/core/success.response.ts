import { Response } from './response';
export class SuccessResponse extends Response {
	private data?: any;
	constructor(code?: number, message?: string, data?: any) {
		super(code || 200, message || 'Success');
		this.data = data;
	}
	setData(data: any): SuccessResponse {
		this.data = data;
		return this;
	}
}