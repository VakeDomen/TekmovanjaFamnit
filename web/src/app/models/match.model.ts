export interface Match {
	id?: string;
    competition_id: string;
    round: string;
    sumission_id_1: string;
    submission_id_2: string;
    submission_id_winner: string;
    log_path: string;
    additional_data: string;
}