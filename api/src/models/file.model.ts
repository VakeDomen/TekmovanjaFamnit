import { DbItem } from './core/db.item';
export class File extends DbItem {
	
    path: string;

	constructor(data: any) {
		super(data);
        this.path = data.path;
    }
}