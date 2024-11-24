import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { OAuth2Client } from 'google-auth-library';
import { createReadStream } from 'fs';
import * as mime from 'mime-types';

@Injectable()
export class GmailService {
  private oAuth2Client: OAuth2Client;

  constructor() {
    const credentials = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'credentials.json'), 'utf8'),
    );
    const { client_secret, client_id, redirect_uris } = credentials.web;
    this.oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );

    // Load token if exists
    const tokenPath = path.join(__dirname, 'token.json');
    if (fs.existsSync(tokenPath)) {
      const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      this.oAuth2Client.setCredentials(token);
    }
  }

  getAuthUrl() {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send'],
    });
  }

  async getAccessTokenFromCode(code: string) {
    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(
        path.join(__dirname, 'token.json'),
        JSON.stringify(tokens),
      );
      return { success: true };
    } catch (err) {
      console.error('Error retrieving access token', err);
      throw err;
    }
  }

  async isAuthenticated() {
    const tokenPath = path.join(__dirname, 'token.json');
    return fs.existsSync(tokenPath);
  }

  async sendEmail(to: string, subject: string, message: string, attachments: Express.Multer.File[] = []) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
      const raw = await this.createEmail(to, subject, message, attachments);

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: raw,
        },
      });

      // Cleanup temporary files after sending
      this.cleanupAttachments(attachments);
      
      return { success: true, messageId: response.data.id };
    } catch (error) {
      // Cleanup files even if sending fails
      this.cleanupAttachments(attachments);
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private async createEmail(to: string, subject: string, message: string, attachments: Express.Multer.File[]) {
    const boundary = 'boundary' + Date.now().toString();
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      message,
    ];

    // Add attachments
    for (const file of attachments) {
      const content = await this.readFileAsBase64(file.path);
      const mimeType = mime.lookup(file.originalname) || file.mimetype;

      emailLines.push(
        `--${boundary}`,
        `Content-Type: ${mimeType}`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${file.originalname}"`,
        '',
        content
      );
    }

    emailLines.push(`--${boundary}--`);
    
    const email = emailLines.join('\r\n').trim();
    return Buffer.from(email).toString('base64url');
  }

  private async readFileAsBase64(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(filePath);
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('base64'));
      });
    });
  }

  private cleanupAttachments(attachments: Express.Multer.File[]) {
    attachments.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error(`Error deleting file ${file.path}:`, error);
      }
    });
  }
}