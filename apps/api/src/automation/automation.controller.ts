import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { AutomationService } from './automation.service';

@UseGuards(JwtAuthGuard)
@Controller('automation/rules')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.automationService.findAll(user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRuleDto) {
    return this.automationService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.automationService.update(id, user.organizationId, dto);
  }
}
