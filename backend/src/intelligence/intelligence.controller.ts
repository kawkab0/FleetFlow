import { Controller, Get, UseGuards } from '@nestjs/common';

import { IntelligenceService } from './intelligence.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntelligenceController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
  ) {}

  @Get('intelligence')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getIntelligence() {
    return this.intelligenceService.getIntelligence();
  }

  @Get('profitability')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getProfitability() {
    return this.intelligenceService.getProfitability();
  }

  @Get('fuel-intelligence')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getFuelIntelligence() {
    return this.intelligenceService.getFuelIntelligence();
  }

  @Get('maintenance-intelligence')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getMaintenanceIntelligence() {
    return this.intelligenceService.getMaintenanceIntelligence();
  }

  @Get('recommendations')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getRecommendations() {
    return this.intelligenceService.getRecommendations();
  }

  @Get('alerts')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getAlerts() {
    return this.intelligenceService.getAlerts();
  }

  @Get('route-intelligence')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getRouteIntelligence() {
    return this.intelligenceService.getRouteIntelligence();
  }

  @Get('driver-intelligence')
  @Roles('Admin', 'Fleet Manager', 'Operations', 'Finance', 'Viewer')
  getDriverIntelligence() {
    return this.intelligenceService.getDriverIntelligence();
  }
}
