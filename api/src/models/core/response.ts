import * as express from 'express';
export class Response {
	private code: number;
	private message: string | undefined;
	constructor(code: number, message: string | undefined) {
		this.code = code;
		this.message = message;
	}
	setMessage(message: string): void {
		this.message = message;
	}
	setCode(code: number): void {
		this.code = code;
	}
	getCode(): number {
		return this.code;
	}
	send(expressResponse: express.Response): void {
		expressResponse.status(this.code);
		expressResponse.send(this);
	}
}