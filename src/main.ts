// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3001);
  const origin = config.get<string>('app.frontendUrl', 'http://localhost:3000');
  const isDev = config.get('app.nodeEnv') !== 'production';

  // ── Security ─────────────────────────────────────────────
  // Relax helmet's CSP in dev so Swagger UI loads its inline scripts
  app.use(helmet({
      contentSecurityPolicy: isDev ? false : undefined,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cookieParser());

  // ── CORS ─────────────────────────────────────────────────
  const allowedOrigins = [
    origin,
    'https://cheesepay.xyz',
    'https://www.cheesepay.xyz',
  ].filter(Boolean);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true)
      if (allowedOrigins.includes(requestOrigin)) return callback(null, true)
      callback(new Error(`Origin ${requestOrigin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-App-Version',
      'X-Platform',
    ],
  });

  // ── Global validation ─────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── API prefix ────────────────────────────────────────────
  app.setGlobalPrefix('v1');

  // ── Swagger (dev + staging only) ─────────────────────────
  if (isDev) {
    const swaggerDoc = new DocumentBuilder()
      .setTitle('Cheese Wallet API')
      .setDescription(
        '🧀 Custodial USDC wallet for Nigeria. ' +
          'All protected endpoints require a Bearer JWT — ' +
          'call POST /v1/auth/login, copy the accessToken, ' +
          'then click **Authorize** above and paste it.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token', // <-- this key is referenced in @ApiBearerAuth() decorators
      )
      .addTag('Auth', 'Signup, login, OTP, PIN, password reset')
      .addTag('Devices', 'Device key registration and management')
      .addTag('Wallet', 'Balance and deposit address')
      .addTag('Rates', 'USD/NGN exchange rate')
      .addTag('Transactions', 'Transaction history')
      .addTag('Send', 'Send USDC by username or Stellar address')
      .addTag('Banks', 'Nigerian bank list, account resolution, NGN payout')
      .addTag('Card', 'Virtual Mastercard management')
      .addTag('Notifications', 'In-app notification feed')
      .addTag('Profile', 'User profile and KYC')
      .addTag('Earn', 'USDC yield positions')
      .addTag('Referral', 'Referral codes and rewards')
      .addTag('Waitlist', 'Pre-launch waitlist signup')
      .addTag('PayLink', 'Payment request links (Cash App-style)')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerDoc);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // keeps the token after page refresh
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(`   Swagger UI  : http://localhost:${port}/docs`);
  }

  // ── Graceful shutdown ─────────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`\n🧀 Cheese Wallet API running on http://localhost:${port}/v1`);
  console.log(`   Environment : ${config.get('app.nodeEnv')}`);
  console.log(`   Stellar     : ${config.get('stellar.network')}`);
  console.log(`   Frontend    : ${origin}\n`);
}

bootstrap();
