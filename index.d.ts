/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SessionData } from 'express-session';

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.wav' {
  const content: any;
  export default content;
}

module 'express-session' {
  // eslint-disable-next-line no-shadow
  export interface SessionData {
    user?: any;
  }
}
