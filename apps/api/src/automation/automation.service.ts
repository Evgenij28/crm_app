import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.automationRule.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { stage: true },
    });
  }

  create(organizationId: string, dto: CreateRuleDto) {
    return this.prisma.automationRule.create({
      data: {
        organizationId,
        name: dto.name,
        stageId: dto.stageId,
        event: 'DEAL_STAGE_CHANGED',
        actionType: dto.actionType,
        payload: dto.payload as Prisma.InputJsonValue | undefined,
        isEnabled: dto.isEnabled ?? true,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateRuleDto) {
    const existing = await this.prisma.automationRule.findFirst({
      where: { id, organizationId },
    });
    if (!existing) {
      throw new NotFoundException('Rule not found');
    }

    return this.prisma.automationRule.update({
      where: { id },
      data: dto,
    });
  }

  async handleDealStageChanged(params: {
    organizationId: string;
    dealId: string;
    stageId?: string | null;
  }): Promise<void> {
    const { organizationId, dealId, stageId } = params;
    if (!stageId) {
      return;
    }

    const rules = await this.prisma.automationRule.findMany({
      where: {
        organizationId,
        isEnabled: true,
        stageId,
        event: 'DEAL_STAGE_CHANGED',
      },
    });

    for (const rule of rules) {
      if (rule.actionType === 'CREATE_TASK') {
        const payload = (rule.payload ?? {}) as {
          title?: string;
          description?: string;
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
        };

        await this.prisma.task.create({
          data: {
            organizationId,
            dealId,
            title: payload.title ?? `Задача по автоматизации: ${rule.name}`,
            description: payload.description,
            priority: payload.priority ?? 'MEDIUM',
          },
        });
      }

      await this.prisma.dealHistory.create({
        data: {
          organizationId,
          dealId,
          type: 'AUTOMATION',
          message: `Сработало правило автоматизации: ${rule.name}`,
          payload: {
            ruleId: rule.id,
            actionType: rule.actionType,
          },
        },
      });
    }
  }
}
