import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PipelinesService } from './pipelines.service';

@UseGuards(JwtAuthGuard)
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.pipelinesService.findAll(user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePipelineDto) {
    return this.pipelinesService.create(user.organizationId, dto);
  }

  @Post(':pipelineId/stages')
  addStage(
    @Param('pipelineId') pipelineId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePipelineStageDto,
  ) {
    return this.pipelinesService.addStage(user.organizationId, pipelineId, dto);
  }

  @Get(':pipelineId/kanban')
  getKanban(
    @Param('pipelineId') pipelineId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.pipelinesService.getKanban(user.organizationId, pipelineId);
  }
}
