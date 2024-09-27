import { HTTP } from '@/request';
import { log } from '@/configs';

export const getUser = async (option: { email: string, token: string, role: string }) => {
	const error: Exception = {
		message: 'no access to request.',
		code: 'FORBIDDEN',
		status: 403,
		reason: {},
		source: ['api-gateway']
	};

	try {
		const user = await HTTP.checkUser(option);

		if (!user) {
			throw error;
		}
		return user;
	} catch (e) {
		log('api-gateway-checkUser').error(e);
		throw error;
	}
};
