import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.deal.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        contact: true,
      },
    });
  }

  create(organizationId: string, dto: CreateDealDto) {
    const amount =
      dto.amount === undefined ? undefined : new Prisma.Decimal(dto.amount);

    return this.prisma.deal.create({
      data: {
        organizationId,
        title: dto.title,
        description: dto.description,
        stage: dto.stage,
        contactId: dto.contactId,
        amount,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateDealDto) {
    const existing = await this.prisma.deal.findFirst({
      where: { id, organizationId },
    });
    if (!existing) {
      throw new NotFoundException('Deal not found');
    }

    const amount =
      dto.amount === undefined ? undefined : new Prisma.Decimal(dto.amount);

    return this.prisma.deal.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        stage: dto.stage,
        contactId: dto.contactId,
        amount,
      },
      include: { contact: true },
    });
  }
}
