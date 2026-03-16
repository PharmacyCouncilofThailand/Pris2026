/**
 * Logger utility for pris-web-v2
 * 
 * In development: logs to console
 */

const isDev = process.env.NODE_ENV === 'development';

interface LogContext {
    component?: string;
    action?: string;
    [key: string]: unknown;
}

export const logger = {
    error: (message: string, error?: unknown, context?: LogContext) => {
        if (isDev) {
            console.error(`[ERROR] ${message}`, error, context);
        }
    },
    warn: (message: string, context?: LogContext) => {
        if (isDev) {
            console.warn(`[WARN] ${message}`, context);
        }
    },
    info: (message: string, context?: LogContext) => {
        if (isDev) {
            console.info(`[INFO] ${message}`, context);
        }
    },
    debug: (message: string, context?: LogContext) => {
        if (isDev) {
            console.debug(`[DEBUG] ${message}`, context);
        }
    },
};

export default logger;
