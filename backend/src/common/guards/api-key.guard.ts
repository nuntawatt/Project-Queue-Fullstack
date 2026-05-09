import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../api-key/entities/api-key.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const keyHeader = req.headers['x-api-key'];
    const actualKeyString = Array.isArray(keyHeader)
      ? keyHeader[0]
      : (keyHeader ?? '');

    if (!actualKeyString) {
      throw new UnauthorizedException('Missing API key');
    }

    // 1. Check Master Key from .env
    const expectedKey = Buffer.from(this.config.get<string>('apiKey') ?? '');
    const actualKeyBuf = Buffer.from(actualKeyString);

    if (expectedKey.length > 0 && expectedKey.length === actualKeyBuf.length) {
      if (timingSafeEqual(expectedKey, actualKeyBuf)) {
        return true;
      }
    }

    // 2. Check Database for valid API Key
    try {
      const apiKeyRecord = await this.apiKeyRepo.findOne({
        where: { key: actualKeyString },
      });

      if (apiKeyRecord && apiKeyRecord.isActive) {
        return true;
      }
    } catch {
      // Database might not be ready or table not created yet
    }

    throw new UnauthorizedException('Invalid API key');
  }
}
