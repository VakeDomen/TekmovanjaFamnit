import { DbItem } from './core/db.item';
export class User extends DbItem {
	
    ldap_dn: string;
    name: string;
    registered: string;
	
	constructor(data: any) {
		super(data);
        this.ldap_dn = data.ldap_dn;
        this.name = data.name;
        this.registered = data.registered;
	}
}