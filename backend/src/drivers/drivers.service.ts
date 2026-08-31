import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,
  ) {}

  // GET ALL DRIVERS
  async findAll(): Promise<Driver[]> {
    return this.driversRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  // GET ONE DRIVER
  async findOne(id: number): Promise<Driver> {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  // CREATE DRIVER
  async create(driverData: Partial<Driver>): Promise<Driver> {
    const driver = this.driversRepository.create(driverData);

    return this.driversRepository.save(driver);
  }

  // UPDATE DRIVER
  async update(
    id: number,
    driverData: Partial<Driver>,
  ): Promise<Driver> {
    const driver = await this.findOne(id);

    Object.assign(driver, driverData);

    return this.driversRepository.save(driver);
  }

  // DELETE DRIVER
  async remove(id: number): Promise<void> {
    const driver = await this.findOne(id);

    await this.driversRepository.remove(driver);
  }
}
