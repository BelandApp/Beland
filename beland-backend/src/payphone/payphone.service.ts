// payphone.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PayphoneService {
  constructor(
    private readonly http: HttpService,
    private readonly logger = new Logger(PayphoneService.name),
    private clientId = process.env.PAYPHONE_CLIENT_ID,
    private clientSecret = process.env.PAYPHONE_CLIENT_SECRET,
    private baseUrl = process.env.PAYPHONE_BASE_URL,
  ) {}
  
  private async getAuthToken(): Promise<string> {
    const url = `${this.baseUrl}/oauth/token`;
    const body = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
    const resp = await firstValueFrom(this.http.post(url, body));
    return resp.data.access_token;
  }

  /** Recarga (carga de dinero a la wallet) */
  async createCharge(amountUsd: number, cardToken: string, reference: string) {
    const token = await this.getAuthToken();
    const url = `${this.baseUrl}/charges`;
    const body = { amount: amountUsd, card_token: cardToken, reference };
    const headers = { Authorization: `Bearer ${token}` };
    const resp = await firstValueFrom(this.http.post(url, body, { headers }));
    this.logger.debug(`Charge response: ${JSON.stringify(resp.data)}`);
    return resp.data;
  }

  /** Solicitud de retiro (payout) */
  async createPayout(amountUsd: number, bankAccount: any, reference: string) {
    const token = await this.getAuthToken();
    const url = `${this.baseUrl}/payouts`;
    const body = { amount: amountUsd, bank_account: bankAccount, reference };
    const headers = { Authorization: `Bearer ${token}` };
    const resp = await firstValueFrom(this.http.post(url, body, { headers }));
    this.logger.debug(`Payout response: ${JSON.stringify(resp.data)}`);
    return resp.data;
  }

  /** Consultar estado de transacción */
  async getTransactionStatus(txId: string) {
    const token = await this.getAuthToken();
    const url = `${this.baseUrl}/transactions/${txId}`;
    const headers = { Authorization: `Bearer ${token}` };
    const resp = await firstValueFrom(this.http.get(url, { headers }));
    return resp.data;
  }
}