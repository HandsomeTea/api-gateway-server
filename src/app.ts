import express from 'express';
// import cookieParser from 'cookie-parser';

const app = express();

// app.use(cookieParser());

import { receive, checkAdmParams } from './auth';
import proxy from './proxy';

app.use(receive, checkAdmParams);
app.use(proxy);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.use((err: Exception, req: Request, res: Response, _next: NextFunction) => { /* eslint-disable-line*/
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    res.status(err.status || 500).send({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        message: err.message || `url: [{${req.method.toLowerCase()}} => ${req.originalUrl}] not found!`,
        code: err.code || 'URL_NOT_FOUND',
        status: err.status || 500,
        reason: err.reason || {},
        source: ['api-gateway']
    } as Exception);
});

export default app;
