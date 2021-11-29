import { DbItem } from './core/db.item';
export class User extends DbItem {
	
    ldap_dn: string;
    name: string;
    created: string;
	
	constructor(data: any) {
		super(data);
        this.ldap_dn = data.ldap_dn;
        this.name = data.name;
        this.created = data.created;
	}

    fromLdap(ldapUser: any): User {
        this.ldap_dn = ldapUser.dn;
        this.name = ldapUser.cn;
        return this;
    }
}