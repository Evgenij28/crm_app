import { Injectable } from '@nestjs/common';
import { MembershipRole, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createWithOrganization(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }): Promise<{
    userId: string;
    organizationId: string;
    role: MembershipRole;
  }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      const organization = await tx.organization.create({
        data: { name: data.organizationName },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: MembershipRole.OWNER,
        },
      });

      return {
        userId: user.id,
        organizationId: organization.id,
        role: membership.role,
      };
    });

    return result;
  }

  findMembership(userId: string, organizationId: string) {
    return this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }

  findFirstMembershipForUser(userId: string) {
    return this.prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
