import path from 'path';
import { Enforcer, newEnforcer } from 'casbin';


/**
 * 示例：
 * casbin.check({ sub: 'alice', obj: 'data1', act: 'read' })
 * 参考：
 * https://casbin.org/casbin-editor/#6TQQJ8EQF
 **/
export const casbin = new class Casbin {
	private server!: Enforcer;
	private status: boolean = false;

	constructor() {
		this.init();
	}

	private async init() {
		const enforcer = await newEnforcer(
			path.join(__dirname, '../../config/basic_model.conf'),
			path.join(__dirname, '../../config/basic_policy.csv')
		);

		this.server = enforcer;
		this.status = true;
	}

	async check(option: { sub: string, obj: string, act: string }): Promise<boolean> {
		return await this.server.enforce(option.sub, option.obj, option.act);
	}

	get isOk() {
		return this.status;
	}
};
