// src/auth/auth.controller.ts
import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Post, Req, Res, UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ConfigService }  from '@nestjs/config'
import { Public }         from '../common/decorators/public.decorator'
import { CurrentUser }    from '../common/decorators/current-user.decorator'
import { OtpType }        from '../otp/entities/otp.entity'
import { AuthService }    from './auth.service'
import { JwtRefreshGuard } from './guards/jwt.guard'
import {
  ChangePinDto, ForgotPasswordDto, LoginDto, ResendOtpDto,
  ResetPasswordDto, SignupDto, VerifyOtpDto, VerifyPinDto,
} from './dto'
import { User } from './entities/user.entity'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config:      ConfigService,
  ) {}

  // ── POST /auth/signup ────────────────────────────────────
  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto)
  }

  // ── POST /auth/verify-otp ────────────────────────────────
  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto)
  }

  // ── POST /auth/resend-otp ────────────────────────────────
  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email, dto.type as OtpType)
  }

  // ── POST /auth/login ─────────────────────────────────────
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, {
      userAgent: req.headers['user-agent'],
      ip:        req.ip,
    })

    // Set refresh token as httpOnly cookie
    this.setRefreshCookie(res, result.tokens.refreshToken)

    return {
      user:   result.user,
      tokens: { accessToken: result.tokens.accessToken },
    }
  }

  // ── POST /auth/refresh ───────────────────────────────────
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request & { user: { user: User; tokenHash: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(
      req.user.user,
      req.user.tokenHash,
      { userAgent: req.headers['user-agent'], ip: req.ip },
    )
    // Refresh token is rotated — set new cookie
    // (new refresh token is issued inside authService.refresh)
    return result
  }

  // ── POST /auth/logout ────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken  = req.cookies?.['refresh_token']
    const { createHash } = require('crypto')
    const tokenHash = rawToken
      ? createHash('sha256').update(rawToken).digest('hex')
      : ''

    await this.authService.logout(user.id, tokenHash)
    res.clearCookie('refresh_token')
    return { message: 'Logged out' }
  }

  // ── GET /auth/me ──────────────────────────────────────────
  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user)
  }

  // ── POST /auth/forgot-password ────────────────────────────
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto)
    return { message: 'If an account exists, a reset code has been sent.' }
  }

  // ── POST /auth/reset-password ─────────────────────────────
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto)
    return { message: 'Password reset successful' }
  }

  // ── POST /auth/verify-pin ─────────────────────────────────
  @Post('verify-pin')
  @HttpCode(HttpStatus.OK)
  async verifyPin(@CurrentUser() user: User, @Body() dto: VerifyPinDto) {
    return this.authService.verifyPin(user.id, dto)
  }

  // ── POST /auth/change-pin ─────────────────────────────────
  @Post('change-pin')
  @HttpCode(HttpStatus.OK)
  async changePin(@CurrentUser() user: User, @Body() dto: ChangePinDto) {
    await this.authService.changePin(user.id, dto)
    return { message: 'PIN updated successfully' }
  }

  // ── Helpers ───────────────────────────────────────────────
  private setRefreshCookie(res: Response, token: string) {
    const days = 30
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure:   this.config.get('app.nodeEnv') === 'production',
      sameSite: 'strict',
      maxAge:   days * 24 * 60 * 60 * 1000,
      path:     '/auth/refresh',
    })
  }
}
