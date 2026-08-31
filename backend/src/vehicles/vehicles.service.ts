import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find();
  }

  async findOne(id: number): Promise<Vehicle | null> {
    return this.vehicleRepository.findOne({
      where: { id },
    });
  }

  async create(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const newVehicle = this.vehicleRepository.create(vehicle);

    return this.vehicleRepository.save(newVehicle);
  }

  async update(
    id: number,
    vehicle: Partial<Vehicle>,
  ): Promise<Vehicle | null> {
    await this.vehicleRepository.update(id, vehicle);

    return this.vehicleRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.vehicleRepository.delete(id);
  }
}
