import { DbItem } from './core/db.item';
export class Contestant extends DbItem {
	
    user_id: string;
    game_id: string;
    created: string;
    active_submission_id: string;	


	constructor(data: any) {
		super(data);
        this.user_id = data.user_id;
        this.game_id = data.game_id;
        this.created = data.created;
        this.active_submission_id = data.active_submission_id;
	}
}