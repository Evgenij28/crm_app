import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.contact.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(organizationId: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        organizationId,
        ...dto,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateContactDto) {
    const existing = await this.prisma.contact.findFirst({
      where: { id, organizationId },
    });
    if (!existing) {
      throw new NotFoundException('Contact not found');
    }

    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }
}
