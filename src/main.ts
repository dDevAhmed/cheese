// src/main.ts
import { NestFactory }          from '@nestjs/core'
import { ValidationPipe }       from '@nestjs/common'
import { ConfigService }        from '@nestjs/config'
import * as cookieParser        from 'cookie-parser'
import helmet                   from 'helmet'
import { AppModule }            from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  const config = app.get(ConfigService)
  const port   = config.get<number>('app.port', 3001)
  const origin = config.get<string>('app.frontendUrl', 'http://localhost:3000')

  // ── Security ─────────────────────────────────────────────
  app.use(helmet())
  app.use(cookieParser())

  // ── CORS ─────────────────────────────────────────────────
  app.enableCors({
    origin,
    credentials:     true,
    methods:         ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders:  ['Content-Type', 'Authorization', 'X-App-Version', 'X-Platform'],
  })

  // ── Global validation ────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist:            true,     // strip unknown properties
    forbidNonWhitelisted: true,
    transform:            true,     // auto-transform to DTO types
    transformOptions:     { enableImplicitConversion: true },
  }))

  // ── API prefix ───────────────────────────────────────────
  app.setGlobalPrefix('v1')

  await app.listen(port)
  console.log(`\n🧀 Cheese Wallet API running on http://localhost:${port}/v1`)
  console.log(`   Environment: ${config.get('app.nodeEnv')}`)
  console.log(`   Stellar:     ${config.get('stellar.network')}\n`)
}

bootstrap()
