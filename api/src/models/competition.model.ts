import internal from 'stream';
import { DbItem } from './core/db.item';
export class Competition extends DbItem {
	
    game_id: string;
    competition_name: string;
    start: string;
    end: string;
    allowed_submissions: number;
    active_round_type_id: string;
	
	constructor(data: any) {
		super(data);
        this.game_id = data.game_id;
        this.competition_name = data.competition_name;
        this.start = data.start;
        this.end = data.end;
        this.allowed_submissions = data.allowed_submissions;
        this.active_round_type_id = data.active_round_type_id;
	}
}