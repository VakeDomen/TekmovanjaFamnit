import { User } from "./user.model";

export interface AuthResp {
    user: User;
    token: string;
    admin: boolean;
}