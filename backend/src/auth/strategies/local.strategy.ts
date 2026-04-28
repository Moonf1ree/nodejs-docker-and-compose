import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    try {
      const user = await this.authService.validateUser(username, password);
      return { id: user.id, username: user.username };
    } catch {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
  }
}
