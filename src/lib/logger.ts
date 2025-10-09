export const logger = {
    info: (...args: any[]) => {
        console.info(...args);
    },
    warn: (...args: any[]) => {
        console.warn(...args);
    },
    error: (...args: any[]) => {
        console.error(...args);
    },
    debug: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
        console.debug(...args);
        }
    }
    };