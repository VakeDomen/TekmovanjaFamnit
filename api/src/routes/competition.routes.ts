import * as express from 'express';
import { isRequestAdmin, isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update, query } from '../database/database.handler';
import { Competition } from '../models/competition.model';
import { ErrorResponse } from '../models/core/error.response';
import { Contestant } from '../models/contestant.model';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/competition", async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.competitions, new Competition(req.query));
    return new SuccessResponse().setData(data).send(resp);
});


router.get("/api/competition/running", async (req: express.Request, resp: express.Response) => {
    const data = await fetch<Competition>(conf.tables.competitions, new Competition(req.query));
    return new SuccessResponse().setData(data.filter((com: Competition) => isCompetitionRunning(com))).send(resp);
});

router.get("/api/competition/competing", async (req: express.Request, resp: express.Response) => {
    const [isAdmin, id]: [boolean, string] = await isRequestAdmin(req);
    const data = await query<Competition>(getCompetingCometitionsQuery(id));
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/competition/:id", async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await fetch<any>(conf.tables.competitions, new Competition({ id: req.params['id'] }));
    const contestants = await fetch(conf.tables.contestants, new Contestant({ competition_id: req.params['id'] }));
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
    const competitions = await fetch<any>(conf.tables.competitions, new Competition(req.params)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    const competition = competitions?.pop();
    if (!competition) {
        return new ErrorResponse().setError("Competition does not exist").send(resp);
    }
    competition.active_round++;
    delete competition.created;
    await update(conf.tables.competitions, new Competition(competition)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    const constestants = await query<any>(getConstestantsRoundQuery(req.params['id'])).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    const data = {
        round: competition.active_round,
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

function isCompetitionRunning(competition: Competition): boolean {
    return new Date().getTime() >= new Date(competition.start).getTime() &&
        new Date().getTime() <= new Date(competition.end).getTime();
}
function getCompetingCometitionsQuery(userId: string): string {
    return `
    SELECT c.*
    FROM competitions c
    RIGHT JOIN (
        SELECT *
        FROM contestants cnt
        WHERE cnt.user_id = "${userId}"
    ) cnt
    ON c.id = cnt.competition_id
    `;
}

