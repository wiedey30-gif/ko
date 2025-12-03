import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QuickRestoService {
  private readonly logger = new Logger(QuickRestoService.name);
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const rawUrl = this.configService.get<string>('QR_API_URL') || '';
    const cloudName = this.configService.get<string>('QR_CLOUD_NAME') || '';
    this.baseUrl = rawUrl.replace('{layer_name}', cloudName);
    
    const login = this.configService.get<string>('QR_LOGIN') || '';
    const pass = this.configService.get<string>('QR_PASSWORD') || '';
    const credentials = Buffer.from(`${login}:${pass}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  // Обновленный метод: поддерживает filters
  async listObjects<T>(moduleName: string, className: string, filters: any[] = []): Promise<T[]> {
    try {
      const url = `${this.baseUrl}/api/list`;
      
      const params: any = {
        moduleName,
        className,
        limit: 2000,
      };

      // Если есть фильтры, добавляем их как JSON строку
      if (filters && filters.length > 0) {
        params.filters = JSON.stringify(filters);
      }

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 
            Authorization: this.authHeader,
            'Content-Type': 'application/json' 
          },
          params: params,
        }),
      );
      return response.data; 
    } catch (error) {
      // Логируем ошибку, но возвращаем пустой массив, чтобы не ронять сервер
      return [];
    }
  }

  async readObject(moduleName: string, className: string, objectId: number): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/read`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.authHeader, 'Content-Type': 'application/json' },
          params: { moduleName, className, objectId },
        }),
      );
      return response.data; 
    } catch (error) {
      return null;
    }
  }

  async postCommand<T>(endpoint: string, body: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await firstValueFrom(
      this.httpService.post(url, body, {
        headers: { Authorization: this.authHeader, 'Content-Type': 'application/json' },
      }),
    );
    return response.data;
  }
}