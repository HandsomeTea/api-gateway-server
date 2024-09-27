import { Request, Response, NextFunction } from 'express';
import Proxy from 'http-proxy';
import { getENV } from '@/configs';

export const proxyToUserService = (req: Request, res: Response, next: NextFunction, proxy: Proxy) => {
    // 可正则匹配
    if (!req.url.startsWith('/api/cppbuildcli/')) {
        return next();
    }
    const userServiceAddr = getENV('USER_MANAGER_ADDR');

    proxy.web(req, res, {
        target: userServiceAddr
    });
};
