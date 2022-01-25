import * as express from 'express';
export class Response {
	private code: number;
	private message: string | undefined;
	constructor(code: number, message: string | undefined) {
		this.code = code;
		this.message = message;
	}
	setMessage(message: string): Response {
		this.message = message;
		return this;
	}
	setCode(code: number): Response {
		this.code = code;
		return this;
	}
	getCode(): number {
		return this.code;
	}
	send(expressResponse: express.Response): void {
		expressResponse.status(this.code);
		expressResponse.send(this);
	}
}