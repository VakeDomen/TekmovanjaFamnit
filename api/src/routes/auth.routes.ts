import * as express from 'express';
import { signIn } from '../auth/jwt.authenticator';
import { authenticateLDAP } from '../auth/ldap.authenticator';
import { isRegistered, register } from '../auth/local.authenticator';
import { ErrorResponse } from '../models/core/error.response';
import { SuccessResponse } from '../models/core/success.response';
import { User } from '../models/user.model';

const router: express.Router = express.Router();

module.exports = router;


router.post('//auth/ldap', async (req: any, resp: any) => {
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
    return new SuccessResponse().setData({user: user, token: token}).send(resp);
});