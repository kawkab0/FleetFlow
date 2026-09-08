import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { AuditLogsService } from './audit-logs.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get('module/:module')
  findByModule(@Param('module') module: string) {
    return this.auditLogsService.findByModule(module);
  }

  @Get('user/:id')
  findByUser(@Param('id', ParseIntPipe) id: number) {
    return this.auditLogsService.findByUser(id);
  }
}
