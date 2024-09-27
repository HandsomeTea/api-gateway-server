import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { getENV } from '@/configs';

export default new class JWT {
	constructor() {
		this.init();
	}

	private init() {
		if (!this.secret) {
			throw {
				message: 'JWT secret is required!',
				code: 'INTERNAL_SERVER_ERROR',
				status: 500,
				source: ['api-gateway'],
				reason: {}
			} as Exception;
		}
	}

	private get secret() {
		return getENV('JWT_SECRET') as string;
	}

	sign(payload: Record<string, unknown>, option?: Pick<SignOptions, 'issuer' | 'subject' | 'audience' | 'jwtid' | 'expiresIn'>): string {
		return jwt.sign({
			...payload,
			iat: new Date().getTime()
		}, this.secret, {
			noTimestamp: true,
			header: {
				alg: 'HS256',
				typ: 'JWT'
			},
			...option
		});
	}

	verify<T, O = Pick<VerifyOptions, 'issuer' | 'subject' | 'audience' | 'jwtid'>>(jsonWebToken: string, option?: O) {
		try {
			const data = jwt.verify(jsonWebToken, this.secret, {
				...option,
				algorithms: ['HS256']
			}) as JwtPayload;
			const attribute = {
				...data.iss ? { issuer: data.iss } : {},
				...data.sub ? { subject: data.sub } : {},
				...data.aud ? { audience: data.aud } : {},
				...data.jti ? { jwtid: data.jti } : {}
			};

			delete data.iss;
			delete data.sub;
			delete data.aud;
			delete data.exp;
			delete data.nbf;
			delete data.iat;
			delete data.jti;
			return {
				...attribute,
				payload: data
			} as Required<O> & { payload: T };
		} catch (e) {
			throw {
				message: `${e}`,
				code: 'SERVER_REQUEST_UNAUTHORIZED',
				status: 401,
				source: ['api-gateway'],
				reason: {}
			} as Exception;
		}
	}
};
