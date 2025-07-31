import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  // Puedes implementar este método si necesitas obtener token de Management API de Auth0
  async getManagementApiToken(): Promise<string> {
    try {
      const auth0Domain = this.configService.get<string>('AUTH0_DOMAIN');
      const auth0ManagementClientId = this.configService.get<string>(
        'AUTH0_MANAGEMENT_CLIENT_ID',
      );
      const auth0ManagementClientSecret = this.configService.get<string>(
        'AUTH0_MANAGEMENT_CLIENT_SECRET',
      );
      const auth0ManagementAudience = `${auth0Domain}api/v2/`;

      const response = await this.httpService
        .post(`${auth0Domain}oauth/token`, {
          client_id: auth0ManagementClientId,
          client_secret: auth0ManagementClientSecret,
          audience: auth0ManagementAudience,
          grant_type: 'client_credentials',
        })
        .toPromise();

      return response.data.access_token;
    } catch (error: any) {
      console.error(
        'Error getting Auth0 Management API token:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to get Auth0 Management API token.',
      );
    }
  }
}
