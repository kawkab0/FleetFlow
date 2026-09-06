import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AnalyticsService } from './analytics.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('kpis')
  @Roles(
    'Admin',
    'Fleet Manager',
    'Operations',
    'Finance',
    'Viewer',
  )
  getFleetKpis() {
    return this.analyticsService.getFleetKpis();
  }

  @Get('vehicles')
  @Roles(
    'Admin',
    'Fleet Manager',
    'Operations',
    'Viewer',
  )
  getVehicleAnalytics() {
    return this.analyticsService.getVehicleAnalytics();
  }

  @Get('expenses')
  @Roles(
    'Admin',
    'Finance',
    'Viewer',
  )
  getExpenseBreakdown() {
    return this.analyticsService.getExpenseBreakdown();
  }

  @Get('monthly')
  @Roles(
    'Admin',
    'Fleet Manager',
    'Operations',
    'Finance',
    'Viewer',
  )
  getMonthlyAnalytics() {
    return this.analyticsService.getMonthlyAnalytics();
  }
}
