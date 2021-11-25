const uuidv4 = require('uuid/v4');

export class DbItem {

	id: string | undefined;

	constructor(data: any | undefined){
		if (typeof data !== 'undefined') {
			this.id = data.id;
		}
	}
	generateId(): DbItem {
		this.id = uuidv4();return this;
	}
	isEmpty(): boolean {
		for (let data in this){
			if (typeof this[data] !== 'undefined'){
				return false;
			}
		}
		return true;
	}
	valuesToString(): string {
		const str: string[] = [];
		for (let key of Object.keys(this)){
			if (typeof this[key] !== 'undefined'){
				if (key !== 'id') {
					if (typeof this[key] === 'boolean') {
						str.push(key + ' = ' + ((this[key])? 1 : 0));
					} else {
						str.push(key + ' = \'' + this[key] + '\'');
					}
				}
			}
		}
		return str.join(', ');
	}
	whereSimilarString(): string {
		const str: string[] = [];
		for (let key of Object.keys(this)) {
			if (typeof this[key] !== 'undefined') {
				if (key === 'id') continue;
				if (typeof this[key] === 'boolean') {
					str.push(key + ' = ' + ((this[key] ? 1 : 0)));
					continue;
				}
				str.push('UPPER(' + key + ') LIKE UPPER(\'%' + this[key] + '%\')');
			}
		}
		return str.join(', ');
	}
	listKeys(): string{
		const str: string[] = [];
		for (let data of Object.keys(this)){
			if (typeof this[data] !== 'undefined'){
				str.push(data);
			}
		}
		return str.join(', ');
	}
	whereString(): string {
		const str: string[] = [];
		for (let data of Object.keys(this)){
			if (typeof this[data] !== 'undefined') {
				if (typeof this[data] === 'number') {
					str.push(data + ' = ' + this[data] + '');
				} else if (typeof this[data] === 'boolean') {
					str.push(data + ' = ' + ((this[data])? 1 : 0) + '');
				} else {
					str.push(data + ' = \'' + this[data] + '\'');
				}
			}
		}
		if (str.length === 0) return '1';
		return str.join(' AND ');
	}
	listValues(): string{
		const str: string[] = [];
		for (let data of Object.keys(this)) {
			if (typeof this[data] !== 'undefined') {
				if (typeof this[data] === 'boolean') {
					str.push('\'' + ((this[data])? 1 : 0) + '\'');
				} else {
					str.push('\'' + this[data] + '\'');
				}
			}
		}
		return str.join(', ');
	}
	updateValues(updates: DbItem): void {
		for (let key of Object.keys(updates)) {
			if (key !== 'id') this[key] = updates[key];
		}
	}
}