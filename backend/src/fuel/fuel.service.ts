import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fuel } from './entities/fuel.entity';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';

@Injectable()
export class FuelService {
  constructor(
    @InjectRepository(Fuel)
    private readonly fuelRepository: Repository<Fuel>,
  ) {}

  findAll(): Promise<Fuel[]> {
    return this.fuelRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<Fuel | null> {
    return this.fuelRepository.findOne({
      where: { id },
    });
  }

  create(fuel: CreateFuelDto): Promise<Fuel> {
    const newFuel = this.fuelRepository.create(fuel);

    return this.fuelRepository.save(newFuel);
  }

  async update(
    id: number,
    fuel: UpdateFuelDto,
  ): Promise<Fuel | null> {
    const existingFuel = await this.findOne(id);

    if (!existingFuel) {
      return null;
    }

    Object.assign(existingFuel, fuel);

    return this.fuelRepository.save(existingFuel);
  }

  async remove(id: number): Promise<void> {
    await this.fuelRepository.delete(id);
  }
}
