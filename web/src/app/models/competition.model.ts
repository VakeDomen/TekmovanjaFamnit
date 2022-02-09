export interface Competition {
    id?: string;
    game_id: string;
    competition_name: string;
    start: string;
    end: string;
    banner_page: string;
    allowed_submissions: number;
    active_round_type_id: string;
    created?: string;
    contestants?: number;
}