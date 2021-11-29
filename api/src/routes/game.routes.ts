import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, update } from '../database/database.handler';
import { Game } from '../models/game.model';
import { ErrorResponse } from '../models/core/error.response';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/game", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await fetch(conf.tables.games, new Game(req.query));
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/game/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const data = await fetch(conf.tables.games, new Game({id: req.params['id']}));
    new SuccessResponse().setData(data).send(resp);
});

router.post("/api/game", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const game = new Game(req.body);
    game.generateId();
    await insert(conf.tables.games, game).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(game).send(resp);
});

router.patch("/api/game", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    const data = await update(conf.tables.games, new Game(req.body)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    return new SuccessResponse().setData(data).send(resp);
});
