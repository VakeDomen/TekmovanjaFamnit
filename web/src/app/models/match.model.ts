export interface Match {
	id?: string;
    competition_id: string;
    round: string;
    submission_id_1: string;
    submission_id_2: string;
    submission_id_winner: string;
    log_file_id: string;
    additional_data: string;
}