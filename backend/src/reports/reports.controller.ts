import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { ReportsService } from './reports.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Get('fleet')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getFleetReport() {
    return this.reportsService.getFleetReport();
  }

  @Get('trips')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Viewer')
  getTripReport() {
    return this.reportsService.getTripReport();
  }

  @Get('fuel')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Viewer')
  getFuelReport() {
    return this.reportsService.getFuelReport();
  }

  @Get('maintenance')
  @Roles('Admin', 'Fleet Manager', 'Viewer')
  getMaintenanceReport() {
    return this.reportsService.getMaintenanceReport();
  }

  @Get('expenses')
  @Roles('Admin', 'Finance', 'Viewer')
  getExpenseReport() {
    return this.reportsService.getExpenseReport();
  }
}

