import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update, query } from '../database/database.handler';
import { Competition } from '../models/competition.model';
import { ErrorResponse } from '../models/core/error.response';
import { Contestant } from '../models/contestant.model';
import { Round } from '../models/round.model';

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

router.get("/api/round/competition/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const constestants = await query<any>(getConstestantsRoundQuery(req.params['id'])).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    let round = await query<any>(getLastRoundQuery).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    await insert(conf.tables.rounds, new Round({round_type_id: round[0]['round_type_id']})).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    round = await query<any>(getLastRoundQuery).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });

    const data = {
        round: round[0],
        contestants: constestants,
    }
    return new SuccessResponse().setData(data).send(resp);
});

const getConstestantsRoundQuery = (competitionId: string) => { 
    return `
    SELECT con.contestant_id, con.active_submission_id, f.path
    FROM (
        SELECT c.id as contestant_id, c.active_submission_id, s.file_id
        FROM contestants as c
        INNER JOIN submissions as s
        ON c.active_submission_id = s.id
        WHERE active_submission_id IS NOT NULL 
        AND competition_id = '${competitionId}'
    ) as con
    INNER JOIN files as f
    ON con.file_id = f.id
`;
}

const getLastRoundQuery = `
    SELECT r.id, r.round_type_id, rt.type 
    FROM (
        SELECT * FROM rounds ORDER BY id DESC LIMIT 1
    ) as r
    INNER JOIN round_types as rt
    ON r.round_type_id = rt.id
`;