import { DbItem } from './core/db.item';
export class Round extends DbItem {
	
    round_type_id: string;

	constructor(data: any) {
		super(data);
        this.round_type_id = data.round_type_id;
    }
}