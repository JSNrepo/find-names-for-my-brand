import serverless from 'serverless-http';
import { createApp } from '../../src/server/api-app';

const app = createApp();
export const handler = serverless(app);
