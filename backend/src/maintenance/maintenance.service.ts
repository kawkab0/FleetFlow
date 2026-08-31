import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Maintenance } from './entities/maintenance.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
  ) {}

  findAll(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<Maintenance | null> {
    return this.maintenanceRepository.findOne({
      where: { id },
    });
  }

  create(maintenance: Partial<Maintenance>): Promise<Maintenance> {
    const newMaintenance =
      this.maintenanceRepository.create(maintenance);

    return this.maintenanceRepository.save(newMaintenance);
  }

  async update(
    id: number,
    maintenance: Partial<Maintenance>,
  ): Promise<Maintenance | null> {
    const existingMaintenance = await this.findOne(id);

    if (!existingMaintenance) {
      return null;
    }

    Object.assign(existingMaintenance, maintenance);

    return this.maintenanceRepository.save(existingMaintenance);
  }

  async remove(id: number): Promise<void> {
    await this.maintenanceRepository.delete(id);
  }
}
