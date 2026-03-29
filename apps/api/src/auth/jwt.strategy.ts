import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { MembershipRole } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { AuthUser } from './interfaces/auth-user.interface';

interface JwtPayload {
  userId: string;
  organizationId: string;
  role: MembershipRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const membership = await this.usersService.findMembership(
      payload.userId,
      payload.organizationId,
    );

    if (!membership) {
      throw new UnauthorizedException('Membership not found');
    }

    return {
      userId: payload.userId,
      organizationId: payload.organizationId,
      role: membership.role,
    };
  }
}
