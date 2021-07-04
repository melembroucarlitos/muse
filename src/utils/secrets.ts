/* eslint-disable no-console */
import * as crypto from 'crypto';

const sessionSecret = crypto.randomBytes(32).toString('hex');

console.table({ sessionSecret });
