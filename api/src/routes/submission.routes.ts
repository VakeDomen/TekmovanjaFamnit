import * as express from 'express';
import { isRequestAdmin, isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, query, update } from '../database/database.handler';
import { Submission } from '../models/submission.model';
import { ErrorResponse } from '../models/core/error.response';
import { File } from '../models/file.model';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/submission", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.submissions, new Submission(req.query)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});
/**
 * get all submissions of a specific competition
 * admin only
 */
router.get("/api/submission/competition/:competition_id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['competition_id']) {
        return new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const [isAdmin, id]: [boolean, string] = await isRequestAdmin(req);
    if (!isAdmin) {
        return new SuccessResponse(403, "Not Allowed").send(resp);
    }

    const data = await query(getAllSubmissionsOfCompetitionsQuery(req.params['competition_id'])).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/submission/contestant/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await query(getContestantSubmissionQuery(req.params['id'])).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    new SuccessResponse().setData(data).send(resp);
});

router.get("/api/submission/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await fetch(conf.tables.submissions, new Submission({id: req.params['id']}));
    new SuccessResponse().setData(data).send(resp);
});

router.post("/api/submission", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const submission = new Submission(req.body);
    submission.generateId();
    await insert(conf.tables.submissions, submission).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    const data = await query(getInsertedSubmissionQuery(submission.id ?? '')).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    new SuccessResponse().setData(data).send(resp);
});

router.post("/api/submission/upload/:contestant_id/:version", isValidAuthToken, async (req: any, resp: express.Response) => {
    if(!req.files) {
        return new ErrorResponse(400, "No file uploaded!").send(resp);
    }
    if (!req.params['contestant_id'] || !req.params['version']) {
        return new ErrorResponse(400, "Invalid submission!").send(resp);
    }
    const file = new File({path: `resources/submissions/${req.params['contestant_id']}/${req.params['version']}`, open: 0});
    file.generateId();
    await insert(conf.tables.files, file);
    const submission = req.files.submission;
    submission.mv(file.path);
    return new SuccessResponse().setData(file).send(resp);
});

router.put("/api/submission", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await update(conf.tables.submissions, new Submission(req.body)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});


const getContestantSubmissionQuery = (contId: string) => {
    return `
        SELECT s.*, f.path as name
        FROM files f
        RIGHT JOIN (
            SELECT * 
            FROM submissions s
            WHERE s.contestant_id = "${contId}"
        ) s
        ON s.file_id = f.id
        
    `;
}

const getInsertedSubmissionQuery = (id: string) => {
    return `
        SELECT s.*, f.path as name
        FROM files f
        RIGHT JOIN (
            SELECT * 
            FROM submissions s
            WHERE s.id = "${id}"
        ) s
        ON s.file_id = f.id
        
    `;
}

function getAllSubmissionsOfCompetitionsQuery(comId: string): string {
    return `
    SELECT s.*, f.path as name
    FROM files f
    RIGHT JOIN (
        SELECT s.*
        FROM submissions s 
        INNER JOIN ( 
            SELECT * 
            FROM contestants c 
            WHERE c.competition_id = "${comId}"
        ) c 
        ON s.contestant_id = c.id 
        
    ) s
    ON s.file_id = f.id
    `;
}
