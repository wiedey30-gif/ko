import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY_123', // В реальном проекте это выносят в .env
    });
  }

  async validate(payload: any) {
    // Это добавляет данные пользователя в запрос (req.user)
    return { phone: payload.phone, name: payload.name };
  }
}