import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    const pipelines = await this.prisma.dealPipeline.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (pipelines.length > 0) {
      return pipelines;
    }

    return [await this.createDefaultPipeline(organizationId)];
  }

  async create(organizationId: string, dto: CreatePipelineDto) {
    const pipeline = await this.prisma.dealPipeline.create({
      data: {
        organizationId,
        name: dto.name,
        isDefault: dto.isDefault ?? false,
      },
    });

    await this.prisma.dealPipelineStage.createMany({
      data: [
        {
          organizationId,
          pipelineId: pipeline.id,
          name: 'Новая',
          order: 0,
          color: '#60a5fa',
        },
        {
          organizationId,
          pipelineId: pipeline.id,
          name: 'В работе',
          order: 1,
          color: '#22c55e',
        },
        {
          organizationId,
          pipelineId: pipeline.id,
          name: 'Счет',
          order: 2,
          color: '#f59e0b',
        },
      ],
    });

    return this.prisma.dealPipeline.findUniqueOrThrow({
      where: { id: pipeline.id },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  async addStage(
    organizationId: string,
    pipelineId: string,
    dto: CreatePipelineStageDto,
  ) {
    const pipeline = await this.prisma.dealPipeline.findFirst({
      where: { id: pipelineId, organizationId },
    });
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    const maxOrder = await this.prisma.dealPipelineStage.aggregate({
      where: { pipelineId },
      _max: { order: true },
    });

    return this.prisma.dealPipelineStage.create({
      data: {
        organizationId,
        pipelineId,
        name: dto.name,
        color: dto.color,
        order: dto.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });
  }

  async getKanban(organizationId: string, pipelineId: string) {
    const pipeline = await this.prisma.dealPipeline.findFirst({
      where: { id: pipelineId, organizationId },
    });
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    const stages = await this.prisma.dealPipelineStage.findMany({
      where: { organizationId, pipelineId },
      orderBy: { order: 'asc' },
      include: {
        deals: {
          where: { organizationId },
          orderBy: { createdAt: 'desc' },
          include: { contact: true },
        },
      },
    });

    return {
      pipeline,
      stages,
    };
  }

  private async createDefaultPipeline(organizationId: string) {
    const pipeline = await this.prisma.dealPipeline.create({
      data: {
        organizationId,
        name: 'Общая воронка',
        isDefault: true,
      },
    });

    await this.prisma.dealPipelineStage.createMany({
      data: [
        {
          organizationId,
          pipelineId: pipeline.id,
          name: 'Новая',
          order: 0,
          color: '#60a5fa',
        },
        {
          organizationId,
          pipelineId: pipeline.id,
          name: 'Переговоры',
          order: 1,
          color: '#f59e0b',
        },
        {
          organizationId,
          pipelineId: pipeline.id,
          name: 'Закрыто',
          order: 2,
          color: '#22c55e',
        },
      ],
    });

    return this.prisma.dealPipeline.findUniqueOrThrow({
      where: { id: pipeline.id },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }
}
