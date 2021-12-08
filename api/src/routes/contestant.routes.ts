import * as express from 'express';
import { isValidAuthToken, isRequestAdmin } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update } from '../database/database.handler';
import { Contestant } from '../models/contestant.model';
import { ErrorResponse } from '../models/core/error.response';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/contestant", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const [isAdmin, id]: [boolean, string] = await isRequestAdmin(req);
    let data;
    if (!isAdmin) {
        const cont = new Contestant(req.query);
        cont.user_id = id;
        data = await fetch(conf.tables.contestants, cont);
    } else {
        data = await fetch(conf.tables.contestants, new Contestant(req.query));
    }
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/contestant/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await fetch(conf.tables.contestants, new Contestant({id: req.params['id']}));
    new SuccessResponse().setData(data).send(resp);
});

router.post("/api/contestant", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const contestant = new Contestant(req.body);
    contestant.generateId();
    await insert(conf.tables.contestants, contestant).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(contestant).send(resp);
});

router.patch("/api/contestant", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await update(conf.tables.contestants, new Contestant(req.body)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});
