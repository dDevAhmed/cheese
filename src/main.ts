// src/main.ts
import { NestFactory }          from '@nestjs/core'
import { ValidationPipe }       from '@nestjs/common'
import { ConfigService }        from '@nestjs/config'
import * as cookieParser        from 'cookie-parser'
import helmet                   from 'helmet'
import { AppModule }            from './app.module'
import { HttpExceptionFilter }  from './common/filters/http-exception.filter'
import { ResponseInterceptor }  from './common/interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  const config = app.get(ConfigService)
  const port   = config.get<number>('app.port', 3001)
  const origin = config.get<string>('app.frontendUrl', 'http://localhost:3000')

  // ── Security ─────────────────────────────────────────────
  app.use(helmet({
    // Allow the public pay page (cheesepay.xyz) to embed content
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))
  app.use(cookieParser())

  // ── CORS ─────────────────────────────────────────────────
  // Allow both the main app origin AND the public pay domain
  const allowedOrigins = [
    origin,
    'https://cheesepay.xyz',
    'https://www.cheesepay.xyz',
  ].filter(Boolean)

  app.enableCors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!requestOrigin) return callback(null, true)
      if (allowedOrigins.includes(requestOrigin)) return callback(null, true)
      callback(new Error(`Origin ${requestOrigin} not allowed`))
    },
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Version', 'X-Platform'],
  })

  // ── Global validation ────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist:            true,   // strip unknown properties
    forbidNonWhitelisted: true,
    transform:            true,   // auto-transform to DTO types
    transformOptions:     { enableImplicitConversion: true },
  }))

  // ── Global exception filter ──────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter())

  // ── Global response interceptor ──────────────────────────
  // Wraps all responses in { success: true, data: ... }
  app.useGlobalInterceptors(new ResponseInterceptor())

  // ── API prefix ───────────────────────────────────────────
  app.setGlobalPrefix('v1')

  // ── Graceful shutdown ────────────────────────────────────
  app.enableShutdownHooks()

  await app.listen(port)

  console.log(`\n🧀 Cheese Wallet API running on http://localhost:${port}/v1`)
  console.log(`   Environment : ${config.get('app.nodeEnv')}`)
  console.log(`   Stellar     : ${config.get('stellar.network')}`)
  console.log(`   Frontend    : ${origin}`)
  console.log(`   Pay domain  : https://cheesepay.xyz\n`)
}

bootstrap()