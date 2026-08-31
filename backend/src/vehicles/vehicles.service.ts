import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({
      relations: {
        driver: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Vehicle | null> {
    return this.vehiclesRepository.findOne({
      where: { id },
      relations: {
        driver: true,
      },
    });
  }

  async create(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehiclesRepository.create(vehicleData);

    return this.vehiclesRepository.save(vehicle);
  }

  async update(
    id: number,
    vehicleData: Partial<Vehicle>,
  ): Promise<Vehicle | null> {
    await this.vehiclesRepository.update(id, vehicleData);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.vehiclesRepository.delete(id);
  }
}
