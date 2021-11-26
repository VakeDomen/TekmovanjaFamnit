import { DbItem } from './core/db.item';
export class Submission extends DbItem {
	
    contestant_id: string;
    timestamp: string;
    version: number;
    path: string;
    additional_data: string;


	constructor(data: any) {
		super(data);
        this.contestant_id = data.contestant_id;
        this.timestamp = data.timestamp;
        this.version = data.version;
        this.path = data.path;
        this.additional_data = data.additional_data;
    }
}