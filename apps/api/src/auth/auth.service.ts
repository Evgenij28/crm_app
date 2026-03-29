import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(
      dto.email.toLowerCase(),
    );
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await hash(dto.password, 10);
    const membership = await this.usersService.createWithOrganization({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      organizationName: dto.organizationName,
    });

    return this.createTokenPayload({
      userId: membership.userId,
      organizationId: membership.organizationId,
      role: membership.role,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = await this.usersService.findFirstMembershipForUser(
      user.id,
    );

    if (!membership) {
      throw new UnauthorizedException('No organization assigned');
    }

    return this.createTokenPayload({
      userId: user.id,
      organizationId: membership.organizationId,
      role: membership.role,
    });
  }

  private async createTokenPayload(payload: {
    userId: string;
    organizationId: string;
    role: string;
  }) {
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: payload,
    };
  }
}
