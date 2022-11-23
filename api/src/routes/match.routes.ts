import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update, query } from '../database/database.handler';
import { Match } from '../models/match.model';
import { ErrorResponse } from '../models/core/error.response';
import { Competition } from '../models/competition.model';
import { Prog1scores } from '../models/prog1scores.model';
import { File } from '../models/file.model';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/match", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.matches, new Match(req.query));
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/match/contestant/:id", async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new ErrorResponse(404, 'No entries found!').send(resp);
    }
    
    const data = await query<any>(constestantMatchQuery(req.params['id'])).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData((data as any[]).map((d: any) => new Match(d).export())).send(resp); 
});

/**
 * gets all scores/"matches" against the prog1 treshold bots for specific contestant
 * id: contestant_id
 */
router.get("/api/match/prog1/:id", async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new ErrorResponse(400, 'Missing id param!').send(resp);
    }
    
    const data = await query<any>(constestantProg1scoresQuery(req.params['id'])).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    if (!data) {
        return new SuccessResponse(404, 'No entries found!').send(resp);
    }
    console.log(data);
    
    for (const data_row of data) {
        for (const index in data_row) {
            if (!data_row[index]) data_row[index] = 0
        }
    }
    return new SuccessResponse().setData(data).send(resp); 
});


router.get("/api/match/submission/:id", async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new ErrorResponse(404, 'No entries found!').send(resp);
    }
    
    const data = await fetch<Match>(conf.tables.matches, new Match({submission_id_1: req.params['id']})).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData((data as any[]).map((d: any) => new Match(d).export())).send(resp); 
});

router.get("/api/match/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await fetch(conf.tables.matches, new Match({id: req.params['id']}));
    return new SuccessResponse().setData(data).send(resp);
});

/**
 * get all matches of a competition in a moving window
 * id: competition id
 */

router.get("/api/match/ranked/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new ErrorResponse(404, 'No entries found!').send(resp);
    }
    const competitions = await fetch<any>(conf.tables.competitions, new Competition(req.params)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    const competition = competitions?.pop();
    if (!competition) {
        return new ErrorResponse().setError("Competition does not exist").send(resp);
    }
    const minRound = competition.active_round - 25;
    const data = await query<Match>(getMatchesInMovingWindowQuery(competition.id, minRound));
    return new SuccessResponse().setData(data).send(resp);
});


router.post("/api/match", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    console.log(req.body);
    
    const match = new Match(req.body);
    match.generateId();
    await insert(conf.tables.matches, match).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(match).send(resp);
});

/**
 * submit wins/losses versus the prog1 treshold bots
 * id: submission id
 */
router.post("/api/match/prog1/:submission_id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['submission_id']) {
        return new ErrorResponse(400, 'Missing id param!').send(resp);
    }
    let existingScore = await fetch<Prog1scores>(conf.tables.prog1scores, new Prog1scores(req.params)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    let scoreToModify
    if (!existingScore || !existingScore.length) {
        scoreToModify = new Prog1scores(req.body);
        scoreToModify.generateId();
        scoreToModify.submission_id = req.params['id']
        await insert(conf.tables.prog1scores, scoreToModify).catch(err => {
            return new ErrorResponse().setError(err).send(resp);
        });
    } else {
        scoreToModify = new Prog1scores(existingScore.pop());
        scoreToModify.easy_wins += req.body['easy_wins'];
        scoreToModify.easy_losses += req.body['easy_losses'];
        scoreToModify.medium_wins += req.body['medium_wins'];
        scoreToModify.medium_losses += req.body['medium_losses'];
        scoreToModify.hard_wins += req.body['hard_wins'];
        scoreToModify.hard_losses += req.body['hard_losses'];
        await update(conf.tables.prog1scores, scoreToModify).catch(err => {
            return new ErrorResponse().setError(err).send(resp);
        });
    }
    
    return new SuccessResponse().send(resp);
});


/**
 * submit a recording of the match
 * id: match id
 * body: { "path": "resources/...." }
 */
 router.post("/api/match/recording/:match_id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['match_id']) {
        return new ErrorResponse(400, 'Missing id param!').send(resp);
    }
    const path = req.body['path'];
    if (!path) {
        return new ErrorResponse(400, 'Missing path attribute in body!').send(resp);
    }
    const matchData = await fetch<Match>(conf.tables.matches, new Match({id: req.params['match_id']})).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    if (!matchData || !matchData.length) {
        return new ErrorResponse(400, 'Can not find the specified match!').send(resp);
    }
    const match = matchData.pop();
    if (!match) {
        return new ErrorResponse(400, 'Can not find the specified match!').send(resp);
    }
    const videoFile = new File({ path: path, open: 1});
    videoFile.generateId();

    await insert(conf.tables.files, videoFile).catch(err => {
        console.log("ERROR in insert");
        
        return new ErrorResponse().setError(err).send(resp);
    });
    
    match.log_file_id = videoFile.id as string;
    console.log(match);
    
    await update(conf.tables.matches, new Match(match)).catch(err => {
        console.log("ERROR in upadte");
        
        return new ErrorResponse().setError(err).send(resp);
    });

    return new SuccessResponse().send(resp);
});

router.patch("/api/match", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await update(conf.tables.matches, new Match(req.body)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});

const constestantMatchQuery = (contestantId: string) => {
    return `
    SELECT DISTINCT m.*
    FROM matches m
    INNER JOIN (
        SELECT s.id
        FROM contestants c
        INNER JOIN submissions s
        ON s.contestant_id = c.id
        WHERE c.id = "${contestantId}"
    ) s
    ON s.id=m.submission_id_1
    OR s.id=m.submission_id_2    
    `;
}

const getMatchesInMovingWindowQuery = (competitionId: string, minRound: number) => {
    return `
        SELECT * 
        FROM matches m
        WHERE m.round >= ${minRound}
        AND competition_id = "${competitionId}"
    `;
}

function constestantProg1scoresQuery(contestantId: string): string {
    return `
        SELECT s.id as "submission_id", p.easy_wins, p.easy_losses, p.medium_wins, p.medium_losses, p.hard_wins, p.hard_losses 
        FROM prog1scores p
        RIGHT JOIN (
            SELECT * 
            FROM submissions s
            WHERE s.contestant_id = "${contestantId}"
        ) s
        ON p.submission_id = s.id
    `;
}
