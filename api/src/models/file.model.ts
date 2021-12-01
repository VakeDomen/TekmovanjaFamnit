import { DbItem } from './core/db.item';
export class File extends DbItem {
	
    path: string;
    open: number;

	constructor(data: any) {
		super(data);
        this.path = data.path;
        this.open = data.open;
    }
}