import * as conf from "../database/database.config.json";
import { fetch, insert } from "../database/database.handler";
import { User } from "../models/user.model";


export async function isRegistered(user: User): Promise<boolean> {
    return !!(await fetch(conf.tables.users, user)).length;
}

export async function register(user: User) {
    user.generateId();
    return await insert(conf.tables.users, user).catch(err => err);
}