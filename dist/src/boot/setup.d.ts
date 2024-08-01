declare module 'express-session' {
    interface SessionData {
        user: {
            [key: string]: {
                email: string;
            };
        };
    }
}
declare const registerCoreMiddleWare: () => import("express-serve-static-core").Express;
declare const startApp: () => void;
export { startApp, registerCoreMiddleWare };
