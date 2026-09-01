import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
  ) {}

  // =========================
  // CREATE TRIP
  // POST /trips
  // =========================

  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  // =========================
  // GET ALL TRIPS
  // GET /trips
  // =========================

  @Get()
  findAll() {
    return this.tripsService.findAll();
  }

  // =========================
  // GET ONE TRIP
  // GET /trips/:id
  // =========================

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tripsService.findOne(id);
  }

  // =========================
  // UPDATE TRIP
  // PATCH /trips/:id
  // =========================

  @Patch(':id')
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tripsService.remove(id);
  }
}
