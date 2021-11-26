import * as express from 'express';
import { signIn } from '../auth/jwt.authenticator';
import { authenticateLDAP } from '../auth/ldap.authenticator';
import { ErrorResponse } from '../models/core/error.response';
import { SuccessResponse } from '../models/core/success.response';

const router: express.Router = express.Router();

module.exports = router;

router.post('/api/auth/ldap', async (req: any, resp: any) => {
    const ldapResp: any = await authenticateLDAP(req.body['username'], req.body['password']).catch(err => {
        return new ErrorResponse().setError(err).send(resp) 
    });
    const token = signIn(ldapResp.dn);
    ldapResp.token = token;
    return new SuccessResponse().setData(ldapResp).send(resp);
});