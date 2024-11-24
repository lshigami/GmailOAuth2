import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GmailService } from './gmail/gmail.service';
import { EmailController } from './gmail/gmail.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [],
  controllers: [AppController, EmailController, AuthController],
  providers: [AppService, GmailService],
})
export class AppModule {}
