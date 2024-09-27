import { Request, Response, NextFunction } from 'express';
import proxy from 'http-proxy';
import { proxyToUserService } from './proxy';

const proxyServer = proxy.createProxyServer();

export default (req: Request, res: Response, next: NextFunction) => {
	proxyToUserService(req, res, next, proxyServer);
};
