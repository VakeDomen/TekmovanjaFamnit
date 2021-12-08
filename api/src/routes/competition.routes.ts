import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update } from '../database/database.handler';
import { Competition } from '../models/competition.model';
import { ErrorResponse } from '../models/core/error.response';
import { Contestant } from '../models/contestant.model';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/competition", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.competitions, new Competition(req.query));
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/competition/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await fetch<any>(conf.tables.competitions, new Competition({id: req.params['id']}));
    const contestants = await fetch(conf.tables.contestants, new Contestant({competition_id: req.params['id']}));
    if (data.length) {
        data[0].contestants = contestants.length;
    }
    return new SuccessResponse().setData(data).send(resp);
});

router.post("/api/competition", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const competition = new Competition(req.body);
    competition.generateId();
    await insert(conf.tables.competitions, competition).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(competition).send(resp);
});

router.patch("/api/competition", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await update(conf.tables.competitions, new Competition(req.body)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});
