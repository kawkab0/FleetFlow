import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseRepository.find();
  }

  async findOne(id: number): Promise<Warehouse | null> {
    return this.warehouseRepository.findOne({
      where: { id },
    });
  }

  async create(warehouse: Partial<Warehouse>): Promise<Warehouse> {
    const newWarehouse = this.warehouseRepository.create(warehouse);

    return this.warehouseRepository.save(newWarehouse);
  }

  async update(
    id: number,
    warehouse: Partial<Warehouse>,
  ): Promise<Warehouse | null> {
    await this.warehouseRepository.update(id, warehouse);

    return this.warehouseRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.warehouseRepository.delete(id);
  }
}
