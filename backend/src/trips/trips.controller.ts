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

import { TripsService } from './trips.service';

import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

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

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
  ) {}

  @Post()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  create(
    @Body() createTripDto: CreateTripDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tripsService.create(
      createTripDto,
      request.user,
    );
  }

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll() {
    return this.tripsService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTripDto: UpdateTripDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tripsService.update(
      id,
      updateTripDto,
      request.user,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tripsService.remove(
      id,
      request.user,
    );
  }
}