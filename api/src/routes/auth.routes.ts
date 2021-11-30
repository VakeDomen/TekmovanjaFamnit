import * as express from 'express';
import { env } from 'process';
import { signIn } from '../auth/jwt.authenticator';
import { authenticateLDAP } from '../auth/ldap.authenticator';
import { isRegistered, register } from '../auth/local.authenticator';
import { ErrorResponse } from '../models/core/error.response';
import { SuccessResponse } from '../models/core/success.response';
import { User } from '../models/user.model';

const router: express.Router = express.Router();

module.exports = router;


router.post('/api/auth/ldap', async (req: any, resp: any) => {
    /*
        MAKE THIS BETTER!! (ADMIN LOGIN)
    */
    if (req.body['password'] == process.env.ADMIN_PASSWORD) {
        const token = signIn('admin');
        return new SuccessResponse().setData({user: new User({name: 'Admin'}), token: token, admin: true}).send(resp);
    }
    /*
        LDAP login
    */
    if (!req.body['username'] || !req.body['password']) {
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
        register(user);
    }
    const token = signIn(ldapResp.dn);
    return new SuccessResponse().setData({user: user, token: token, admin: false}).send(resp);
});