import 'express-session';
// import { Session } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user: {
      email: string;
    };
  }
}

export {};