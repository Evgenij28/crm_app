import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TimelineEventType } from '@prisma/client';
import { AutomationService } from '../automation/automation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddDealNoteDto } from './dto/add-deal-note.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: AutomationService,
  ) {}

  findAll(organizationId: string) {
    return this.prisma.deal.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        contact: true,
        pipeline: true,
        pipelineStage: true,
      },
    });
  }

  async create(organizationId: string, userId: string, dto: CreateDealDto) {
    const amount =
      dto.amount === undefined ? undefined : new Prisma.Decimal(dto.amount);

    const created = await this.prisma.deal.create({
      data: {
        organizationId,
        title: dto.title,
        description: dto.description,
        stage: dto.stage,
        contactId: dto.contactId,
        pipelineId: dto.pipelineId,
        stageId: dto.stageId,
        amount,
      },
      include: {
        contact: true,
        pipeline: true,
        pipelineStage: true,
      },
    });

    await this.prisma.dealHistory.create({
      data: {
        organizationId,
        dealId: created.id,
        userId,
        type: TimelineEventType.SYSTEM,
        message: `Сделка создана: ${created.title}`,
      },
    });

    return created;
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    dto: UpdateDealDto,
  ) {
    const existing = await this.prisma.deal.findFirst({
      where: { id, organizationId },
      include: { pipelineStage: true },
    });
    if (!existing) {
      throw new NotFoundException('Deal not found');
    }

    const amount =
      dto.amount === undefined ? undefined : new Prisma.Decimal(dto.amount);

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        stage: dto.stage,
        contactId: dto.contactId,
        pipelineId: dto.pipelineId,
        stageId: dto.stageId,
        amount,
      },
      include: { contact: true, pipeline: true, pipelineStage: true },
    });

    if (dto.stageId && dto.stageId !== existing.stageId) {
      await this.prisma.dealHistory.create({
        data: {
          organizationId,
          dealId: id,
          userId,
          type: TimelineEventType.STAGE_CHANGED,
          message: `Этап изменен: ${existing.pipelineStage?.name ?? '—'} -> ${updated.pipelineStage?.name ?? '—'}`,
          payload: {
            fromStageId: existing.stageId,
            toStageId: dto.stageId,
          },
        },
      });

      await this.automationService.handleDealStageChanged({
        organizationId,
        dealId: id,
        stageId: dto.stageId,
      });
    }

    return updated;
  }

  async findOne(id: string, organizationId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, organizationId },
      include: {
        contact: true,
        pipeline: true,
        pipelineStage: true,
        tasks: {
          include: {
            assignees: { include: { user: true } },
            project: true,
          },
        },
      },
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async getTimeline(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.dealHistory.findMany({
      where: { dealId: id, organizationId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async addNote(
    id: string,
    organizationId: string,
    userId: string,
    dto: AddDealNoteDto,
  ) {
    await this.findOne(id, organizationId);
    return this.prisma.dealHistory.create({
      data: {
        organizationId,
        dealId: id,
        userId,
        type: TimelineEventType.NOTE,
        message: dto.message,
      },
    });
  }
}
