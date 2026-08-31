import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trip } from './entities/trip.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  async findAll(): Promise<Trip[]> {
    return this.tripRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Trip | null> {
    return this.tripRepository.findOne({
      where: { id },
    });
  }

  async create(trip: Partial<Trip>): Promise<Trip> {
    const newTrip = this.tripRepository.create(trip);

    return this.tripRepository.save(newTrip);
  }

  async update(
    id: number,
    trip: Partial<Trip>,
  ): Promise<Trip | null> {
    await this.tripRepository.update(id, trip);

    return this.tripRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.tripRepository.delete(id);
  }
}
