import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CreateEmailDto } from './dto/create-email.dto';

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

  async sendMail(email:CreateEmailDto) {
    try {
      const {to, subject, text, html } = email
      const info = await this.transporter.sendMail({
        from: `"Beland" <${process.env.EMAIL_USER}>`,
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
