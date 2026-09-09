import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,

    private readonly auditLogsService: AuditLogsService,
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

  async create(
    maintenance: CreateMaintenanceDto,
    user: AuthenticatedUser,
  ): Promise<Maintenance> {
    const newMaintenance =
      this.maintenanceRepository.create(
        maintenance,
      );

    const savedMaintenance =
      await this.maintenanceRepository.save(
        newMaintenance,
      );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Maintenance',
      recordId: savedMaintenance.id,
      newValues: { ...savedMaintenance },
      description: `Created maintenance record #${savedMaintenance.id}`,
    });

    return savedMaintenance;
  }

  async update(
    id: number,
    maintenance: UpdateMaintenanceDto,
    user: AuthenticatedUser,
  ): Promise<Maintenance | null> {
    const existingMaintenance =
      await this.findOne(id);

    if (!existingMaintenance) {
      return null;
    }

    const oldValues = {
      ...existingMaintenance,
    };

    Object.assign(
      existingMaintenance,
      maintenance,
    );

    const updatedMaintenance =
      await this.maintenanceRepository.save(
        existingMaintenance,
      );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Maintenance',
      recordId: id,
      oldValues,
      newValues: { ...updatedMaintenance },
      description: `Updated maintenance record #${id}`,
    });

    return updatedMaintenance;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingMaintenance =
      await this.findOne(id);

    if (!existingMaintenance) {
      return;
    }

    const oldValues = {
      ...existingMaintenance,
    };

    await this.maintenanceRepository.remove(
      existingMaintenance,
    );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Maintenance',
      recordId: id,
      oldValues,
      description: `Deleted maintenance record #${id}`,
    });
  }
}
