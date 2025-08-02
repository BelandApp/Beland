// payphone/webhook.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class PayphoneWebhookGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const signature = req.headers['x-payphone-signature'] as string;
    if (!signature) {
      throw new UnauthorizedException('Missing PayPhone signature');
    }

    const secret = this.config.get<string>('PAYPHONE_WEBHOOK_SECRET');
    const rawBody = req.body.toString('utf8'); // aquí body es un Buffer
    const expected = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expected) {
      throw new UnauthorizedException('Invalid PayPhone signature');
    }

    return true;
  }
}