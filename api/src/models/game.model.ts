import { DbItem } from './core/db.item';
export class Game extends DbItem {
	
    name: string;
    image_file_id: string;
    game_pack_file_id: string;
    game_description: string;
    submission_description: string;

	constructor(data: any) {
		super(data);
        this.name = data.name;
        this.image_file_id = data.image_file_id;
        this.game_pack_file_id = data.game_pack_file_id;
        this.game_description = data.game_description;
        this.submission_description = data.submission_description;
    }
}