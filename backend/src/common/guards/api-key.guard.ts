import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers['x-api-key'];

    const expectedKey = Buffer.from(this.config.get<string>('apiKey') ?? '');
    const actualKey = Buffer.from(Array.isArray(key) ? key[0] : (key ?? ''));

    if (
      expectedKey.length !== actualKey.length ||
      !timingSafeEqual(expectedKey, actualKey)
    ) {
      throw new UnauthorizedException(
        'Invalid or missing API key — set header: x-api-key',
      );
    }
    return true;
  }
}
