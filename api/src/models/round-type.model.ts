import { DbItem } from './core/db.item';
export class RoundType extends DbItem {
	
    type: string;

	constructor(data: any) {
		super(data);
        this.type = data.type;
    }
}