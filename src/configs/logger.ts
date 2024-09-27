import log4js from 'log4js';
import { getENV } from './env';

/**
 * 定义日志配置
 */
export const updateOrCreateLogInstance = (): void => {
	log4js.configure({
		disableClustering: true, //支持nodejs集群启动模式
		appenders: {
			_audit: {
				type: 'dateFile',
				filename: 'public/logs/audit', //您要写入日志文件的路径
				alwaysIncludePattern: true, //（默认为false） - 将模式包含在当前日志文件的名称以及备份中
				pattern: 'yyyy-MM-dd.log', //（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
				encoding: 'utf-8',
				layout: {
					type: 'pattern',
					pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] [%X{Module}]  %m%n '
				}
			},
			_develop: {
				type: 'stdout',
				layout: {
					type: 'pattern',
					pattern: '[%d{ISO8601_WITH_TZ_OFFSET}] [%p] [%X{Module}] [%f:%l:%o] %[ %m%n %]'
				}
			},
			_system: {
				type: 'stdout',
				layout: {
					type: 'pattern',
					pattern: '[%d{ISO8601_WITH_TZ_OFFSET}] [%p] [SYSTEM:%X{Module}] %[ %m%n %]'
				}
			}
			// [2021-09-23 16:59:33.762] %d{yyyy-MM-dd hh:mm:ss.SSS}
			// [2021-08-05T18:17:00.549] %d
			// [2021-08-05T18:17:39.235+0800] %d{ISO8601_WITH_TZ_OFFSET}
			// [18:18:21.475] %d{ABSOLUTE}
			// [05 08 2021 18:19:20.196] %d{DATE}
			// [2021-08-05T18:19:44.804] %d{ISO8601}
		},
		categories: {
			default: {
				appenders: ['_develop', '_audit', '_system'],
				level: 'OFF',
				enableCallStack: true
			},
			developLog: {
				appenders: ['_develop'],
				level: getENV('DEV_LOG_LEVEL') || getENV('LOG_LEVEL') || 'OFF',
				enableCallStack: true
			},
			auditLog: {
				appenders: ['_audit'],
				level: getENV('AUDIT_LOG_LEVEL') || getENV('LOG_LEVEL') || 'ALL',
				enableCallStack: true
			},
			systemLog: {
				appenders: ['_system'],
				level: 'ALL'
			}
		}
	});
};

/**
 * 开发时打印日志使用
 */
export const log = (module?: string): log4js.Logger => {
	const _devLogger = log4js.getLogger('developLog');

	_devLogger.addContext('Module', module || 'HTTP_REQUEST');

	return _devLogger;
};

/**
 * 操作日志使用
 */
export const audit = (module?: string): log4js.Logger => {
	const _auditLogger = log4js.getLogger('auditLog');

	_auditLogger.addContext('Module', (module || 'default-module').toUpperCase());

	return _auditLogger;
};

/**
 * 系统日志使用
 * @param {string} module
 */
export const system = (module: string): log4js.Logger => {
	const _systemLogger = log4js.getLogger('systemLog');

	_systemLogger.addContext('Module', module.toUpperCase());

	return _systemLogger;
};
