import axios from 'axios';
import { env } from '@/config/env';

const baseUrl = env.remnawavePanelUrl;

export const instance = axios.create({
  baseURL: baseUrl,
  headers: {
    'user-agent': 'Remnawave Mini App Subscription Page',
    Authorization: `Bearer ${env.remnawaveToken}`,
  },
});

if (baseUrl?.startsWith('http://')) {
  instance.defaults.headers.common['x-forwarded-for'] = '127.0.0.1';
  instance.defaults.headers.common['x-forwarded-proto'] = 'https';
}

if (env.authApiKey) {
  instance.defaults.headers.common['X-Api-Key'] = env.authApiKey;
}
