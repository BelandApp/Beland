import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Gmail ya trae la configuración de host/puerto
      auth: {
        user: process.env.EMAIL_USER, // tu email de Gmail
        pass: process.env.EMAIL_PASS, // tu app password
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Mi App 🚀" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      return { success: true, info };
    } catch (err) {
      throw new InternalServerErrorException(
        'Error enviando correo: ' + err,
      );
    }
  }
}
