import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Warehouse } from './entities/warehouse.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseRepository.find();
  }

  async findOne(id: number): Promise<Warehouse | null> {
    return this.warehouseRepository.findOne({
      where: { id },
    });
  }

  async create(
    warehouse: Partial<Warehouse>,
    user: AuthenticatedUser,
  ): Promise<Warehouse> {
    const newWarehouse =
      this.warehouseRepository.create(warehouse);

    const savedWarehouse =
      await this.warehouseRepository.save(newWarehouse);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Warehouses',
      recordId: savedWarehouse.id,
      oldValues: null,
      newValues:
        savedWarehouse as unknown as Record<string, unknown>,
      description: `Warehouse #${savedWarehouse.id} created`,
    });

    return savedWarehouse;
  }

  async update(
    id: number,
    warehouse: Partial<Warehouse>,
    user: AuthenticatedUser,
  ): Promise<Warehouse | null> {
    const existingWarehouse =
      await this.warehouseRepository.findOne({
        where: { id },
      });

    if (!existingWarehouse) {
      return null;
    }

    const oldValues = {
      ...existingWarehouse,
    };

    await this.warehouseRepository.update(id, warehouse);

    const updatedWarehouse =
      await this.warehouseRepository.findOne({
        where: { id },
      });

    if (!updatedWarehouse) {
      return null;
    }

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Warehouses',
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedWarehouse as unknown as Record<string, unknown>,
      description: `Warehouse #${id} updated`,
    });

    return updatedWarehouse;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingWarehouse =
      await this.warehouseRepository.findOne({
        where: { id },
      });

    if (!existingWarehouse) {
      return;
    }

    await this.warehouseRepository.delete(id);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Warehouses',
      recordId: id,
      oldValues:
        existingWarehouse as unknown as Record<string, unknown>,
      newValues: null,
      description: `Warehouse #${id} deleted`,
    });
  }
}
