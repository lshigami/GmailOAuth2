import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFiles,
  BadRequestException,
  PayloadTooLargeException,
  Logger
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GmailService } from './gmail.service';

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);
  constructor(private readonly gmailService: GmailService) {}

  @Post('send')
  @UseInterceptors(FilesInterceptor('attachments', 5, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit per file
      files: 5 // Maximum 5 files
    },
    fileFilter: (req, file, callback) => {
      // Allowed file types
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
      }
    }
  }))
  async sendEmail(
    @Body() body: { to: string; subject: string; message: string },
    @UploadedFiles() files: Express.Multer.File[] = []
  ) {
    try {
      const { to, subject, message } = body;
      this.logger.log(`Sending email to ${to} with subject: ${subject}`);
      this.logger.log(`Attachments: ${files.map(f => f.originalname).join(', ')}`);
      await this.gmailService.sendEmail(to, subject, message, files);
      return { message: 'Email sent successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to send email: ' + error.message);
    }
  }
}