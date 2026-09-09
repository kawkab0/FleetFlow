import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventory } from './entities/inventory.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      relations: {
        product: true,
        warehouse: true,
      },
    });
  }

  async findOne(id: number): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({
      where: { id },
      relations: {
        product: true,
        warehouse: true,
      },
    });
  }

  async create(
    data: Partial<Inventory>,
    user: AuthenticatedUser,
  ): Promise<Inventory> {
    const inventory =
      this.inventoryRepository.create(data);

    const savedInventory =
      await this.inventoryRepository.save(inventory);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Inventory',
      recordId: savedInventory.id,
      oldValues: null,
      newValues:
        savedInventory as unknown as Record<string, unknown>,
      description: `Inventory record #${savedInventory.id} created`,
    });

    return savedInventory;
  }

  async update(
    id: number,
    data: Partial<Inventory>,
    user: AuthenticatedUser,
  ): Promise<Inventory | null> {
    const inventory =
      await this.inventoryRepository.findOne({
        where: { id },
      });

    if (!inventory) {
      return null;
    }

    const oldValues = {
      ...inventory,
    };

    Object.assign(inventory, data);

    const updatedInventory =
      await this.inventoryRepository.save(inventory);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Inventory',
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedInventory as unknown as Record<string, unknown>,
      description: `Inventory record #${id} updated`,
    });

    return updatedInventory;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<boolean> {
    const inventory =
      await this.inventoryRepository.findOne({
        where: { id },
      });

    if (!inventory) {
      return false;
    }

    const oldValues = {
      ...inventory,
    };

    await this.inventoryRepository.remove(inventory);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Inventory',
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues: null,
      description: `Inventory record #${id} deleted`,
    });

    return true;
  }
}
