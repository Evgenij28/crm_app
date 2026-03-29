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
import { AddDealNoteDto } from './dto/add-deal-note.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealsService } from './deals.service';

@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.dealsService.findAll(user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDealDto) {
    return this.dealsService.create(user.organizationId, user.userId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.dealsService.findOne(id, user.organizationId);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.dealsService.getTimeline(id, user.organizationId);
  }

  @Post(':id/timeline/note')
  addNote(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: AddDealNoteDto,
  ) {
    return this.dealsService.addNote(id, user.organizationId, user.userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateDealDto,
  ) {
    return this.dealsService.update(id, user.organizationId, user.userId, dto);
  }
}
