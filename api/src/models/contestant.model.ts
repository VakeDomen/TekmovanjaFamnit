import { DbItem } from './core/db.item';
export class Contestant extends DbItem {
	
    user_id: string;
    competition_id: string;
    created: string;
    active_submission_id: string;	


	constructor(data: any) {
		super(data);
        this.user_id = data.user_id;
        this.competition_id = data.competition_id;
        this.created = data.created;
        this.active_submission_id = data.active_submission_id;
	}
}