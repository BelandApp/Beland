import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test')
  async sendTestEmail() {
    return this.emailService.sendMail(
      'eze.g.alonso@gmail.com',
      'Prueba de Gmail',
      'Hola, este es un correo de prueba enviado con Nodemailer 🚀',
      '<b>Hola!</b> Este es un correo de <i>prueba</i> enviado desde NestJS con Gmail.',
    );
  }
}
