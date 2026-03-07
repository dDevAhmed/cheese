// src/otp/otp.service.ts
import {
  BadRequestException, Inject, Injectable, Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { createHash, randomInt } from 'crypto'
import * as nodemailer from 'nodemailer'
import { Repository } from 'typeorm'
import { Otp, OtpType } from './entities/otp.entity'

@Injectable()
export class OtpService {
  private readonly logger    = new Logger(OtpService.name)
  private readonly ttl:      number
  private readonly transport: nodemailer.Transporter

  constructor(
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
    private readonly config: ConfigService,
  ) {
    this.ttl = config.get<number>('otp.ttlSeconds', 300)

    this.transport = nodemailer.createTransport({
      host:   config.get<string>('otp.smtpHost'),
      port:   config.get<number>('otp.smtpPort'),
      secure: false,
      auth: {
        user: config.get<string>('otp.smtpUser'),
        pass: config.get<string>('otp.smtpPass'),
      },
    })
  }

  // ── Generate & send ──────────────────────────────────────
  async sendOtp(email: string, type: OtpType): Promise<void> {
    // Invalidate any existing OTPs of same type for this email
    await this.otpRepo.update(
      { email, type, isUsed: false },
      { isUsed: true },
    )

    const code     = String(randomInt(100_000, 999_999))
    const codeHash = this.hashCode(code)
    const expiresAt = new Date(Date.now() + this.ttl * 1000)

    await this.otpRepo.save(this.otpRepo.create({ email, codeHash, type, expiresAt }))

    await this.sendEmail(email, code, type)
  }

  // ── Verify ───────────────────────────────────────────────
  async verifyOtp(email: string, code: string, type: OtpType): Promise<boolean> {
    const codeHash = this.hashCode(code)

    const otp = await this.otpRepo.findOne({
      where: { email, codeHash, type, isUsed: false },
      order: { createdAt: 'DESC' },
    })

    if (!otp) throw new BadRequestException('Invalid or expired OTP')
    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired')
    }
    if (otp.attempts >= 5) {
      throw new BadRequestException('Too many failed attempts. Request a new OTP.')
    }

    await this.otpRepo.update(otp.id, { isUsed: true })
    return true
  }

  // ── Check without consuming (for password reset validation) ──
  async checkOtp(email: string, code: string, type: OtpType): Promise<Otp> {
    const codeHash = this.hashCode(code)
    const otp = await this.otpRepo.findOne({
      where: { email, codeHash, type, isUsed: false },
      order: { createdAt: 'DESC' },
    })
    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP')
    }
    // Increment attempt counter (but don't consume yet)
    await this.otpRepo.increment({ id: otp.id }, 'attempts', 1)
    return otp
  }

  async consumeOtp(id: string): Promise<void> {
    await this.otpRepo.update(id, { isUsed: true })
  }

  // ── Helpers ──────────────────────────────────────────────
  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex')
  }

  private async sendEmail(email: string, code: string, type: OtpType): Promise<void> {
    const subjects: Record<OtpType, string> = {
      [OtpType.EMAIL_VERIFY]:    'Verify your Cheese Wallet email',
      [OtpType.PHONE_VERIFY]:    'Verify your phone number',
      [OtpType.PASSWORD_RESET]:  'Reset your Cheese Wallet password',
      [OtpType.LOGIN_2FA]:       'Your Cheese Wallet login code',
    }

    const from = this.config.get<string>('otp.emailFrom')

    try {
      await this.transport.sendMail({
        from,
        to:      email,
        subject: subjects[type],
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="color:#C9A84C;font-size:28px;margin-bottom:8px">Cheese Wallet</h2>
            <p style="color:#555;font-size:15px;line-height:1.6">Your verification code is:</p>
            <div style="background:#f5f5f5;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
              <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#111">${code}</span>
            </div>
            <p style="color:#888;font-size:13px">This code expires in ${this.ttl / 60} minutes. Do not share it with anyone.</p>
          </div>
        `,
      })
    } catch (err) {
      this.logger.error(`Failed to send OTP email to ${email}: ${err.message}`)
      // Don't throw — OTP is saved, admin can resend
    }
  }
}
