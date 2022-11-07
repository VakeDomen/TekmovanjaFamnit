import { decode } from "punycode";
import { ErrorResponse } from "../models/core/error.response";
import { User } from "../models/user.model";

var jwt = require('jsonwebtoken');

export function signIn(user: User) {
    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: user
    }, process.env.JWT_SECRET);
    console.log(token)
    return token;
}

export async function isRequestAdmin(req: any): Promise<[boolean, string]> {
    const token = extractToken(req);
    if (!token) {
        return [false, ""];
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return [decoded.data.ldap_dn == 'Admin', decoded.data.id];
    } catch (error) {
        return [false, ''];
    }
}

/*
    AUTH MIDDLEWARE 
*/
export function isValidAuthToken(req, resp, next) {
    getAuthToken(req, resp, async (token) => {
        try {
            if (token == process.env.ADMIN_PASSWORD) {
                return next();
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.data) {
                console.log(`[Verify auth middleware] Request made by user: ${decoded.data.name}`);
                return next();
            } else {
                console.log(`[Verify auth middleware] Client not authorized to make a request (token: ${token})`);
                return new ErrorResponse(401, 'Unauthorized').send(resp);
            }
        } catch (error) {
            return new ErrorResponse(401, 'Unauthorized').send(resp);
        }
    })
}


export function refreshAuth(req, resp, next) {
    if (req.headers.authorization) {
        isValidAuthToken(req, resp, next);
    } else {
        next();
    }
}

const extractToken = (req: any): string | null => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        return req.authToken = req.headers.authorization.split(' ')[1];
    }
    return null;
}

const getAuthToken = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return new ErrorResponse(401, 'Unauthorized').send(res);
    }
    next(req.authToken);
};
