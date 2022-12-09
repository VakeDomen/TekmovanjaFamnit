import { DbItem } from './core/db.item';
export class Match extends DbItem {
	
    competition_id: string;
    round: string;
    submission_id_1: string;
    submission_id_2: string;
    submission_id_winner: string;
    log_file_id: string;
    additional_data: string;
	
	constructor(data: any) {
		super(data);
        this.competition_id = data.competition_id;
        this.round = data.round;
        this.submission_id_1 = data.submission_id_1;
        this.submission_id_2 = data.submission_id_2;
        this.submission_id_winner = data.submission_id_winner;
        this.log_file_id = data.log_file_id;
        this.additional_data = data.additional_data;
	}

    export() {
        return {
            id: this.id,
            round: this.round,
            submission_id_1: this.submission_id_1,
            submission_id_2: this.submission_id_2,
            submission_id_winner: this.submission_id_winner,
            additional_data: this.additional_data,
            log_file_id: this.log_file_id,
        }
    }
}