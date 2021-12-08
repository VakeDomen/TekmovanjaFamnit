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

/*
    AUTH MIDDLEWARE 
*/
export function isValidAuthToken(req, resp, next) {
    getAuthToken(req, resp, async (token) => {
        try {
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


const getAuthToken = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        req.authToken = req.headers.authorization.split(' ')[1];
    } else {
        return new ErrorResponse(401, 'Unauthorized').send(res);
    }
    next(req.authToken);
};