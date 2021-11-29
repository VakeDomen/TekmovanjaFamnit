import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update } from '../database/database.handler';
import { Submission } from '../models/submission.model';
import { ErrorResponse } from '../models/core/error.response';
import { File } from '../models/file.model';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/submission", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.submissions, new Submission(req.query));
    return new SuccessResponse().setData(data).send(resp);
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
    return new SuccessResponse().setData(submission).send(resp);
});

router.post("/api/submission/upload/:contestant_id/:version", isValidAuthToken, async (req: any, resp: express.Response) => {
    if(!req.files) {
        return new ErrorResponse(400, "No file uploaded!")
    }
    if (!req.params['contestant_id'] || !req.params['version']) {
        return new ErrorResponse(400, "Invalid submission!")
    }
    const file = new File({path: `resources/submissions/${req.params['contestant_id']}/${req.params['version']}`});
    file.generateId();
    await insert(conf.tables.files, file);
    const submission = req.files.submission;
    submission.mv(file.path);
    return new SuccessResponse().setData(file).send(resp);
});

router.patch("/api/submission", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await update(conf.tables.submissions, new Submission(req.body)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});
