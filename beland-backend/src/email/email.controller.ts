import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test')
  async sendTestEmail() {
    const email: CreateEmailDto = {
      to: 'eze.g.alonso@gmail.com',
      subject: 'Prueba de Gmail',
      text: 'Hola, este es un correo de prueba enviado con Nodemailer 🚀',
      html: '<b>Hola!</b> Este es un correo de <i>prueba</i> enviado desde NestJS con Gmail.',
    }
    return this.emailService.sendMail(email);
  }
}
