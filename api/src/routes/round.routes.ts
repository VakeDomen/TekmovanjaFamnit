import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update } from '../database/database.handler';
import { Round } from '../models/round.model';
import { ErrorResponse } from '../models/core/error.response';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/round", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.rounds, new Round(req.query));
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/round/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await fetch(conf.tables.rounds, new Round({id: req.params['id']}));
    new SuccessResponse().setData(data).send(resp);
});

router.post("/api/round", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const round = new Round(req.body);
    round.generateId();
    await insert(conf.tables.rounds, round).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(round).send(resp);
});

router.patch("/api/round", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await update(conf.tables.rounds, new Round(req.body)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});
