import { DbItem } from './core/db.item';
export class Game extends DbItem {
	
    name: string;
    evaluator_path: string;
    game_pack_path: string;

	constructor(data: any) {
		super(data);
        this.name = data.name;
        this.evaluator_path = data.evaluator_path;
        this.game_pack_path = data.game_pack_path;
    }
}