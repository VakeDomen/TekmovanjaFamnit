import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch } from '../database/database.handler';
import { RoundType } from '../models/round-type.model';

const router: express.Router = express.Router();

module.exports = router;

router.get("//round-type", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.round_types, new RoundType(req.query));
    return new SuccessResponse().setData(data).send(resp);
});
