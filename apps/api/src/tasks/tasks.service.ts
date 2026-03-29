import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus, TimelineEventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddTaskCommentDto } from './dto/add-task-comment.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string, userId: string, query: ListTasksQueryDto) {
    const where: Prisma.TaskWhereInput = {
      organizationId,
      status: query.status,
      projectId: query.projectId,
      assignees: query.assigneeId
        ? { some: { userId: query.assigneeId } }
        : undefined,
    };

    if (query.mine === 'true') {
      where.OR = [{ creatorId: userId }, { assignees: { some: { userId } } }];
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        project: true,
        deal: true,
        contact: true,
        assignees: { include: { user: true } },
      },
    });
  }

  async create(organizationId: string, creatorId: string, dto: CreateTaskDto) {
    const created = await this.prisma.task.create({
      data: {
        organizationId,
        creatorId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        projectId: dto.projectId,
        dealId: dto.dealId,
        contactId: dto.contactId,
        assignees: dto.assigneeIds
          ? {
              createMany: {
                data: dto.assigneeIds.map((id) => ({ userId: id })),
              },
            }
          : undefined,
      },
      include: {
        assignees: true,
      },
    });

    if (created.dealId) {
      await this.prisma.dealHistory.create({
        data: {
          organizationId,
          dealId: created.dealId,
          userId: creatorId,
          type: TimelineEventType.SYSTEM,
          message: `Создана связанная задача: ${created.title}`,
          payload: { taskId: created.id },
        },
      });
    }

    return created;
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    dto: UpdateTaskDto,
  ) {
    const existing = await this.prisma.task.findFirst({
      where: { id, organizationId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const nextStatus = dto.status;
    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        projectId: dto.projectId,
        dealId: dto.dealId,
        contactId: dto.contactId,
        assignees: dto.assigneeIds
          ? {
              deleteMany: {},
              createMany: {
                data: dto.assigneeIds.map((assigneeId) => ({
                  userId: assigneeId,
                })),
              },
            }
          : undefined,
      },
      include: {
        assignees: { include: { user: true } },
        project: true,
      },
    });

    if (existing.dealId && nextStatus && nextStatus !== existing.status) {
      await this.prisma.dealHistory.create({
        data: {
          organizationId,
          dealId: existing.dealId,
          userId,
          type: TimelineEventType.SYSTEM,
          message: `Статус задачи изменен: ${existing.status} -> ${nextStatus}`,
          payload: { taskId: existing.id },
        },
      });
    }

    return updated;
  }

  async addComment(
    taskId: string,
    organizationId: string,
    userId: string,
    dto: AddTaskCommentDto,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        message: dto.message,
      },
    });

    if (task.dealId) {
      await this.prisma.dealHistory.create({
        data: {
          organizationId,
          dealId: task.dealId,
          userId,
          type: TimelineEventType.NOTE,
          message: `Комментарий к задаче: ${dto.message}`,
          payload: { taskId },
        },
      });
    }

    return comment;
  }

  async getKanban(organizationId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
      include: { assignees: { include: { user: true } }, project: true },
    });

    return {
      columns: [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.REVIEW,
        TaskStatus.DONE,
      ].map((status) => ({
        status,
        tasks: tasks.filter((task) => task.status === status),
      })),
    };
  }
}
