import { DbItem } from './core/db.item';
export class Match extends DbItem {
	
    competition_id: string;
    round: string;
    sumission_id_1: string;
    submission_id_2: string;
    submission_id_winner: string;
    log_path: string;
    additional_data: string;
	
	constructor(data: any) {
		super(data);
        this.competition_id = data.competition_id;
        this.round = data.round;
        this.sumission_id_1 = data.sumission_id_1;
        this.submission_id_2 = data.submission_id_2;
        this.submission_id_winner = data.submission_id_winner;
        this.log_path = data.log_path;
        this.additional_data = data.additional_data;
	}
}