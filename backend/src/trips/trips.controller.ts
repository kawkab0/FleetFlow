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
import { Trip } from './entities/trip.entity';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  findAll(): Promise<Trip[]> {
    return this.tripsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Trip | null> {
    return this.tripsService.findOne(id);
  }

  @Post()
  create(@Body() trip: Partial<Trip>): Promise<Trip> {
    return this.tripsService.create(trip);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() trip: Partial<Trip>,
  ): Promise<Trip | null> {
    return this.tripsService.update(id, trip);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tripsService.remove(id);
  }
}
