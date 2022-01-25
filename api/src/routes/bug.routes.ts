import * as express from 'express';
import { isValidAuthToken } from '../auth/jwt.authenticator';
import { SuccessResponse } from '../models/core/success.response';
import { ErrorResponse } from '../models/core/error.response';

const router: express.Router = express.Router();



router.post("/api/report/bug", (req: express.Request, resp: express.Response) => {
    if (!(router as any).botContext ) {
        console.log("heyheyhey");
        return new ErrorResponse().setMessage("No report context!").send(resp);
    }
    (router as any).botContext .reply(JSON.stringify(req.body));
    return new SuccessResponse().setData(JSON.stringify(req.body)).send(resp);
});

module.exports = router;

module.exports.initBot = (ctx) => {
    (router as any).botContext = ctx;
    console.log(module.exports)
};

console.log(module.exports)