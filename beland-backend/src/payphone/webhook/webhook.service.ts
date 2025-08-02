// payphone/webhook.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { WalletsService } from 'src/wallets/wallets.service'; 

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly walletSvc: WalletsService) {}

  async processEvent(event: any) {
    this.logger.debug(`PayPhone webhook event: ${event.type}`);

    switch (event.type) {
      case 'charge.succeeded':
        // reference = ID que enviaste al crear el charge
        await this.walletSvc.confirmRecharge(event.data.reference);
        break;

      case 'charge.failed':
        await this.walletSvc.failRecharge(event.data.reference, event.data.reason);
        break;

      case 'payout.completed':
        await this.walletSvc.confirmWithdraw(event.data.reference);
        break;

      case 'payout.failed':
        await this.walletSvc.failWithdraw(event.data.reference, event.data.reason);
        break;

      default:
        this.logger.warn(`Unhandled PayPhone event type: ${event.type}`);
    }
  }
}


/*
    Puntos clave
    URL de webhook debe quedar apuntando a https://tu-dominio.com/webhook/payphone.

    Asegúrate de configurar en el dashboard de PayPhone la versión v1 y la misma ruta.

    La cabecera que envía PayPhone es X-Payphone-Signature y firma el body completo con HMAC-SHA256 usando tu PAYPHONE_WEBHOOK_SECRET.

    Gracias al raw() middleware, solo ese endpoint recibe el body sin parsear, evitando que NestJS lo convierta automáticamente a JSON y rompa la validación de la firma.
*/