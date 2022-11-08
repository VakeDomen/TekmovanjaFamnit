import { DbItem } from "./core/db.item";
export class Prog1scores extends DbItem {
    
    submission_id: string;
    easy_wins: number;
    easy_losses: number;
    medium_wins: number;
    medium_losses: number;
    hard_wins: number;
    hard_losses: number;
    
    constructor(data: any) {
        super(data);
        this.submission_id = data.submission_id;
        this.easy_wins = data.easy_wins;
        this.easy_losses = data.easy_losses;
        this.medium_wins = data.medium_wins;
        this.medium_losses = data.medium_losses;
        this.hard_wins = data.hard_wins;
        this.hard_losses = data.hard_losses;
    }
}
