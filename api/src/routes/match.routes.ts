import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update } from '../database/database.handler';
import { Match } from '../models/match.model';
import { ErrorResponse } from '../models/core/error.response';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/match", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.matches, new Match(req.query));
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/match/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await fetch(conf.tables.matches, new Match({id: req.params['id']}));
    new SuccessResponse().setData(data).send(resp);
});

router.post("/api/match", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const match = new Match(req.body);
    match.generateId();
    await insert(conf.tables.matches, match).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(match).send(resp);
});

router.patch("/api/match", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await update(conf.tables.matches, new Match(req.body)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});
