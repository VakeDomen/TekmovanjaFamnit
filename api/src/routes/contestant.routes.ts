import * as express from 'express';
import { isValidAuthToken, isRequestAdmin, refreshAuth } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import * as conf from '../database/database.config.json';
import { fetch, insert, query, update } from '../database/database.handler';
import { Contestant } from '../models/contestant.model';
import { ErrorResponse } from '../models/core/error.response';
import { User } from '../models/user.model';

const router: express.Router = express.Router();

module.exports = router;

router.get("/api/contestant", refreshAuth, async (req: express.Request, resp: express.Response) => {
    const [isAdmin, id]: [boolean, string] = await isRequestAdmin(req);
    let cont = new Contestant(req.query);
    if (!isAdmin) {
        cont.user_id = id;
    }
    let data = await fetch<Contestant>(conf.tables.contestants, cont).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    if (!data) {
        return new ErrorResponse(404, "No entries found!").send(resp);
    }
    data = await Promise.all(data.map(async (el: Contestant) => {
        const name = await query(getContestantNameQuery(el.id as string)).catch(err => {
            return new ErrorResponse().setError(err).send(resp);
        });
        (el as any).name = name; 
        return el;
    }));
    return new SuccessResponse().setData(data).send(resp);
});

router.get("/api/contestant/:id", isValidAuthToken, async (req: express.Request, resp: express.Response) => {
    if (!req.params['id']) {
        return new SuccessResponse(404, 'No entries found!').send(resp);
    }
    const [isAdmin, id]: [boolean, string] = await isRequestAdmin(req);
    let cont = new Contestant(req.params);
    if (!isAdmin) {
        cont.user_id = id;
    }
    let data = await fetch<Contestant>(conf.tables.contestants, new Contestant({id: req.params['id']})).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    const name = await query(getContestantNameQuery(req.params['id'] as string)).catch(err => {
        return new ErrorResponse().setError(err).send(resp);
    });
    data[0].name = name;
    return new SuccessResponse().setData(data).send(resp);
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


const getContestantNameQuery = (contId: string) => {
    return `
    SELECT u.name
    FROM users u
    RIGHT JOIN contestants c
    ON u.id = c.user_id
    WHERE c.id = "${contId}"
    `;
}