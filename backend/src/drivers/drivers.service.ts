import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find();
  }

  async findOne(id: number): Promise<Driver | null> {
    return this.driverRepository.findOne({
      where: { id },
    });
  }

  async create(driver: Partial<Driver>): Promise<Driver> {
    const newDriver = this.driverRepository.create(driver);

    return this.driverRepository.save(newDriver);
  }

  async update(
    id: number,
    driver: Partial<Driver>,
  ): Promise<Driver | null> {
    await this.driverRepository.update(id, driver);

    return this.driverRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.driverRepository.delete(id);
  }
}
