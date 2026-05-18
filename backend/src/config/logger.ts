import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: {
    service: 'ashimarket-api',
    env: process.env.NODE_ENV ?? 'development',
  },
  serializers: {
    req(request) {
      return {
        method: request.method,
        url: request.url,
        path: request.routerPath,
        parameters: request.params,
        headers: {
          host: request.headers.host,
          'user-agent': request.headers['user-agent'],
          'x-correlation-id': request.headers['x-correlation-id'],
        },
      };
    },
    res(reply) {
      return {
        statusCode: reply.statusCode,
      };
    },
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.passwordHash',
      '*.twoFactorSecret',
      '*.stripeAccountId',
    ],
    censor: '[REDACTED]',
  },
});
