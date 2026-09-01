import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trip } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
  ) {}

  // =========================
  // CREATE TRIP
  // =========================

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const trip = this.tripsRepository.create(createTripDto);

    return this.tripsRepository.save(trip);
  }

  // =========================
  // GET ALL TRIPS
  // =========================

  async findAll(): Promise<Trip[]> {
    return this.tripsRepository.find({
      order: {
        tripDate: 'DESC',
      },
    });
  }

  // =========================
  // GET ONE TRIP
  // =========================

  async findOne(id: number): Promise<Trip> {
    const trip = await this.tripsRepository.findOne({
      where: { id },
    });

    if (!trip) {
      throw new NotFoundException(
        `Trip with ID ${id} not found`,
      );
    }

    return trip;
  }

  // =========================
  // UPDATE TRIP
  // =========================

  async update(
    id: number,
    updateTripDto: UpdateTripDto,
  ): Promise<Trip> {
    const trip = await this.findOne(id);

    Object.assign(trip, updateTripDto);

    return this.tripsRepository.save(trip);
  }

  // =========================
  // DELETE TRIP
  // =========================

  async remove(id: number): Promise<void> {
    const trip = await this.findOne(id);

    await this.tripsRepository.remove(trip);
  }
}
