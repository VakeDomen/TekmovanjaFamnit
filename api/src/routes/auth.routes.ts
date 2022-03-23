import * as express from 'express';
import { signIn } from '../auth/jwt.authenticator';
import { authenticateLDAP } from '../auth/ldap.authenticator';
import { isRegistered, register } from '../auth/local.authenticator';
import { fetch } from '../database/database.handler';
import * as conf from '../database/database.config.json';
import { ErrorResponse } from '../models/core/error.response';
import { SuccessResponse } from '../models/core/success.response';
import { User } from '../models/user.model';

const router: express.Router = express.Router();

module.exports = router;


router.post('/api/auth/ldap', async (req: any, resp: any) => {

    /*
        MAKE THIS BETTER!! (ADMIN LOGIN)
    */
    if (req.body['password'] == process.env.ADMIN_PASSWORD && req.body['username'] == '') {
        const admin = await fetch<User>(conf.tables.users, new User({ name: "Admin"}));
        const token = signIn(admin[0]);
        console.log("[AUTH] admin login");
        return new SuccessResponse().setData({user: admin[0], token: token, admin: true}).send(resp);
    }
    /*
        LDAP login
    */
    if (!req.body['username'] || !req.body['password']) {
        console.log("[AUTH] no creds");
        return new ErrorResponse().send(resp);
    }
    const ldapResp: any = await authenticateLDAP(req.body['username'], req.body['password']).catch(err => {
        return new ErrorResponse().setError(err).send(resp) 
    });
    if (!ldapResp) {
        return;
    }
    const user = new User({}).fromLdap(ldapResp);
    if (!await isRegistered(user)) {
        await register(user);
    } else {
        const tmpUser = await fetch<User>(conf.tables.users, user);
        user.id = tmpUser[0].id;
    }
    const token = signIn(user);
    return new SuccessResponse().setData({user: user, token: token, admin: false}).send(resp);
});