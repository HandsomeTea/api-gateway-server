import axios, { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse, AxiosError, Method, AxiosInstance } from 'axios';
import Agent from 'agentkeepalive';

import { log, getENV } from '@/configs';
import JWT from './jwt';

export abstract class BaseRequest {
    abstract server: AxiosInstance;
    constructor() {
        //
    }

    beforeSendToServer(config: InternalAxiosRequestConfig) {
        const { url, baseURL, method, params, data, headers } = config;
        const address = new URL(`${baseURL ? baseURL + url : url}`);

        log(`request-to:[(${method}) ${address.origin + address.pathname}]`).info(JSON.stringify({
            headers,
            query: Object.keys(params || {}).length > 0 ? params : (() => {
                const obj: Record<string, string> = {};

                [...address.searchParams.entries()].map(a => obj[a[0]] = a[1]);
                return obj;
            })(),
            body: data || {}
        }, null, '   '));

        return config;
    }

    beforeSendToServerButError(error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        log('request-to-other-server').error(error);
        throw error;
    }

    async receiveSuccessResponse(response: AxiosResponse) {
        const { data, config: { method, baseURL, url }/*, headers, request, status, statusText*/ } = response;
        const address = new URL(`${baseURL ? baseURL + url : url}`);

        log(`response-from:[(${method}) ${address.origin + address.pathname}]`).info(JSON.stringify(data, null, '   '));
        return Promise.resolve(data);
    }

    receiveResponseNotSuccess(error: AxiosError) {
        const { response, config, request } = error;

        let target = null;

        if (config) {
            const { url, baseURL, method } = config;

            target = `(${method}): ${baseURL ? baseURL + url : url}`;
        } else if (request) {
            target = request.responseURL;
        } else {
            log('response-from-other-server-error').error(error);
            throw error;
        }
        const address = new URL(config ? `${config.baseURL ? config.baseURL + config.url : config.url}` : `${target}`);
        const _target = config ? `(${config.method}) ${address.origin + address.pathname}` : address.origin + address.pathname;

        if (response) {
            const { status, statusText, data } = response;

            log(`response-from:[${_target}]`).error({
                status,
                statusText,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                ...typeof data === 'string' ? { msg: data } : data
            });
            throw data;
        }

        log(`response-from:[${_target}]`).error(error);
        throw {
            message: `request to ${target} error : no response.`,
            code: '',
            status: 500,
            reason: {},
            source: ['api-gateway']
        } as Exception;
    }

    async send(url: string, method: Method, baseURL?: string, options?: httpArgument) {
        return await this.server.request(<AxiosRequestConfig>{
            url,
            method,
            baseURL,
            headers: options?.headers,
            params: options?.params,
            data: options?.data
        });
    }
}

class VendorRequest extends BaseRequest {
    server = axios.create({
        timeout: 60000,
        httpAgent: new Agent({
            keepAlive: true,
            maxSockets: 100,
            maxFreeSockets: 10,
            timeout: 60000,
            freeSocketTimeout: 30000
        }),
        headers: {
            Authorization: `Bearer ${JWT.sign({}, { jwtid: 'xxx-api-gateway', expiresIn: '30s' })}`
        }
    });

    constructor() {
        super();
        this.server.interceptors.request.use(this.beforeSendToServer, this.beforeSendToServerButError);
        this.server.interceptors.response.use(this.receiveSuccessResponse, this.receiveResponseNotSuccess);
    }

    async sendToUserService(method: Method, url: string, options?: httpArgument) {
        return await this.send(url, method, getENV('USER_MANAGER_ADDR'), options);
    }
}

export const HTTP = new class _HTTP extends VendorRequest {
    constructor() {
        super();
    }

    async checkUser(option: { email: string, token: string, role: string }) {
        return await this.sendToUserService('get', '/api/cppbuildmgr/v1/project/user', { params: option }) as unknown as string;
    }
};
