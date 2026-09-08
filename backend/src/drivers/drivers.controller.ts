import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { DriversService } from './drivers.service';
import { Driver } from './entities/driver.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
  ) {}

  @Get()
  @Roles(
    'Admin',
    'Fleet Manager',
    'Operations',
  )
  findAll(): Promise<Driver[]> {
    return this.driversService.findAll();
  }

  @Get(':id')
  @Roles(
    'Admin',
    'Fleet Manager',
    'Operations',
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Driver | null> {
    return this.driversService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager')
  create(
    @Body() driver: Partial<Driver>,
    @Req() request: AuthenticatedRequest,
  ): Promise<Driver> {
    return this.driversService.create(
      driver,
      request.user,
    );
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() driver: Partial<Driver>,
    @Req() request: AuthenticatedRequest,
  ): Promise<Driver> {
    return this.driversService.update(
      id,
      driver,
      request.user,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.driversService.remove(
      id,
      request.user,
    );
  }
}