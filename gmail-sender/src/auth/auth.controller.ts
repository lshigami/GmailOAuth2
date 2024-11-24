import { Controller, Get, Logger, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GmailService } from 'src/gmail/gmail.service';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly gmailService: GmailService) {}

  @Get('auth-url')
  getAuthUrl() {
    this.logger.log('Getting auth URL');
    const url = this.gmailService.getAuthUrl();
    this.logger.log(`Auth URL: ${url}`);
    return { url };
  }

  @Get('auth-status')
  async getAuthStatus() {
    this.logger.log('Getting auth status');
    const authenticated = await this.gmailService.isAuthenticated();
    this.logger.log(`Authenticated: ${authenticated}`);
    return { authenticated };
  }

  @Get('authenticate')
  async authenticate(@Query('code') code: string, @Res() res: Response) {
    try {
      this.logger.log(`Received code: ${code}`);
      await this.gmailService.getAccessTokenFromCode(code);
      // Redirect về frontend sau khi authenticate thành công
      res.redirect('http://localhost:5173/auth-success');
    } catch (error) {
      res.redirect('http://localhost:5173/auth-error');
    }
  }
}
