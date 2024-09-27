type LogLevel = 'all' | 'mark' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'off'

interface EnvConfigType {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT: string
    LOG_LEVEL?: LogLevel
    DEV_LOG_LEVEL?: LogLevel
    AUDIT_LOG_LEVEL?: LogLevel
    JWT_SECRET: string
    USER_MANAGER_ADDR: string
}
const defaultConfig: EnvConfigType = {
    NODE_ENV: 'development',
    PORT: '9430',
    LOG_LEVEL: 'all',
    DEV_LOG_LEVEL: 'all',
    AUDIT_LOG_LEVEL: 'all',
    JWT_SECRET: '123',
    USER_MANAGER_ADDR: 'http://localhost:3581'
};

export const getENV = <K extends keyof EnvConfigType>(env: K): EnvConfigType[K] => {
    return process.env[env] as EnvConfigType[K] || defaultConfig[env];
};
