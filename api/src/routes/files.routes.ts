import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import * as conf from '../database/database.config.json';
import { fetch } from '../database/database.handler';
import { File } from '../models/file.model';
import { ErrorResponse } from '../models/core/error.response';

const path = require('path');
const router: express.Router = express.Router();

module.exports = router;

const options = {
    root: '/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
};


/*
    with auth
*/
router.get("/api/serve/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new ErrorResponse(400, "Invalid request").send(resp);
    }
    const images: File[] = (await fetch<File>(conf.tables.files, new File({id: req.params['id']})));

    if (images.length != 1) {
        return new ErrorResponse(400, "Invalid image").send(resp);
    }

    resp.sendFile(path.resolve(`${__dirname}/../../${images[0].path}`), options, function (err) {
        if (err) {
            console.log("error sending image " + req.params['id'], err);
        } else {
            console.log('Sent:', req.params['id']);
        }
    });
});


router.get("/api/download/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new ErrorResponse(400, "Invalid request").send(resp);
    }
    const files: File[] = (await fetch<File>(conf.tables.files, new File({id: req.params['id']})));

    if (files.length != 1) {
        return new ErrorResponse(400, "Invalid image").send(resp);
    }
    resp.download(path.resolve(`${__dirname}/../../${files[0].path}`));
});


/*
    no auth
*/

router.get("/api/open/serve/:id", async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new ErrorResponse(400, "Invalid request").send(resp);
    }
    const images: File[] = (await fetch<File>(conf.tables.files, new File({id: req.params['id']})));

    if (images.length != 1 || images[0].open == 0) {
        return new ErrorResponse(400, "Invalid image").send(resp);
    }

    resp.sendFile(path.resolve(`${__dirname}/../../${images[0].path}`), options, function (err) {
        if (err) {
            console.log("error sending image " + req.params['id'], err);
        } else {
            console.log('Sent:', req.params['id']);
        }
    });
});


router.get("/api/open/download/:id", async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new ErrorResponse(400, "Invalid request").send(resp);
    }
    const files: File[] = (await fetch<File>(conf.tables.files, new File({id: req.params['id']})));

    if (files.length != 1 || files[0].open == 0) {
        return new ErrorResponse(400, "Invalid image").send(resp);
    }
    resp.download(path.resolve(`${__dirname}/../../${files[0].path}`));
});