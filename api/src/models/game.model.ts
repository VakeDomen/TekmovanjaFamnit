import { DbItem } from './core/db.item';
export class Game extends DbItem {
	
    name: string;
    image_path: string;
    game_pack_path: string;
    game_description: string;

	constructor(data: any) {
		super(data);
        this.name = data.name;
        this.image_path = data.image_path;
        this.game_pack_path = data.game_pack_path;
        this.game_description = data.game_description;
    }
}