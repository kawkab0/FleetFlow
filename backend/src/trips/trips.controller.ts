import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { TripsService } from './trips.service';

import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
  ) {}

  // =========================
  // CREATE TRIP
  // POST /trips
  // =========================

  @Post()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  // =========================
  // GET ALL TRIPS
  // GET /trips
  // =========================

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll() {
    return this.tripsService.findAll();
  }

  // =========================
  // GET ONE TRIP
  // GET /trips/:id
  // =========================

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tripsService.findOne(id);
  }

  // =========================
  // UPDATE TRIP
  // PATCH /trips/:id
  // =========================

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, updateTripDto);
  }

  // =========================
  // DELETE TRIP
  // DELETE /trips/:id
  // =========================

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tripsService.remove(id);
  }
}
