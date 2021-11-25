import * as express from 'express';
import { authenticateLDAP } from '../auth/ldap.authenticator';
import { SuccessResponse } from '../models/core/success.response';

const router: express.Router = express.Router();


module.exports = router;

router.get('/api/ldap', async (req: any, resp: any) => {
    return new SuccessResponse().setData(await authenticateLDAP(req.body['username'], req.body['password'])).send(resp);
})