import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { WHITE_PREFIX } from './white-prefix';
import { getUser } from './lib';

/** 白名单检查 */
export const receive = (req: Request, _res: Response, next: NextFunction) => {
	if (!WHITE_PREFIX.find(a => req.url.startsWith(a))) {
		throw {
			message: `url: [{${req.method.toLowerCase()}} => ${req.originalUrl}] not found!`,
			code: 'URL_NOT_FOUND',
			status: 404,
			reason: {},
			source: ['api-gateway']
		} as Exception;
	}
	next();
};

/** admin系统接口权限检查 */
export const checkAdmParams = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
	if (!req.url.match(/\/api\/(.*?)adm\//)) {
		return next();
	}
	const email = req.headers['x-cppbuild-user'] as string;
	const token = req.headers['x-cppbuild-token'] as string;
	const role = req.headers['x-cppbuild-role'] as string;

	if (!email || !token || !role) {
		throw {
			message: 'api for admin, requires necessary parameters to check permissions.',
			code: 'UNAUTHORIZED',
			status: 401,
			reason: {},
			source: ['api-gateway']
		} as Exception;
	}
	await getUser({ email, token, role });
	// const user = await getUser({ email, token, role });

	// if (user.xxx) { }
	next();
});
