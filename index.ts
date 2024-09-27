import './startup';
import { audit, getENV, log, system } from '@/configs';

process.on('unhandledRejection', reason => {
    log('SYSTEM').fatal(reason);
    audit('SYSTEM').fatal(reason);
});

process.on('uncaughtException', reason => {
    log('SYSTEM').fatal(reason);
    audit('SYSTEM').fatal(reason);
});

const port = ((val: string): number => {
    const port = parseInt(val, 10);

    if (port >= 0) {
        return port;
    }

    throw new Error('invalid port!');
})(getENV('PORT') || '3000');

import http from 'http';
import app from '@/app';

app.set('port', port);
const server = http.createServer(app);

/**
 * 健康检查
 */
const isHealth = async () => {
    system('SYSTEM-STATUS').debug('health check: system is normal.');
    return true;
};

/** 健康检查机制 */
import { createTerminus } from '@godaddy/terminus';

createTerminus(server, {
    signal: 'SIGINT',
    healthChecks: {
        '/healthcheck': async () => {
            if (!await isHealth()) {
                throw new Error();
            }
        }
    }
});

process.on('SIGINT', () => {
    process.exit(0);
});

process.on('exit', async () => {
    log('SYSREM_STOP_CLEAN').info('server connection will stop normally.');
});

server.listen(port, () => {
    const _check = setInterval(async () => {
        if (!await isHealth()) {
            return;
        }
        if (process.send) {
            process.send('ready');
        }
        clearInterval(_check);
        system('STARTUP').info(`api gateway service start successful on port:${port}.`);
    }, 1000);
});
