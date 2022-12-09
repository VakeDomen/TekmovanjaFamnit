export interface IdentifiedMatch {
	id?: string;
    competition_id: string;
    round: string;
    submission_id_1: string;
    submission_id_2: string;
    submission_id_winner: string;
    log_path: string;
    additional_data: string;
    log_file_id: string,
    me: 0 | 1
}