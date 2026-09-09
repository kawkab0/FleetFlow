import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Supplier } from './entities/supplier.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find();
  }

  async findOne(id: number): Promise<Supplier | null> {
    return this.supplierRepository.findOne({
      where: { id },
    });
  }

  async create(
    supplier: Partial<Supplier>,
    user: AuthenticatedUser,
  ): Promise<Supplier> {
    const newSupplier =
      this.supplierRepository.create(supplier);

    const savedSupplier =
      await this.supplierRepository.save(newSupplier);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Suppliers',
      recordId: savedSupplier.id,
      oldValues: null,
      newValues:
        savedSupplier as unknown as Record<string, unknown>,
      description: `Supplier #${savedSupplier.id} created`,
    });

    return savedSupplier;
  }

  async update(
    id: number,
    supplier: Partial<Supplier>,
    user: AuthenticatedUser,
  ): Promise<Supplier | null> {
    const existingSupplier =
      await this.supplierRepository.findOne({
        where: { id },
      });

    if (!existingSupplier) {
      return null;
    }

    const oldValues = {
      ...existingSupplier,
    };

    await this.supplierRepository.update(id, supplier);

    const updatedSupplier =
      await this.supplierRepository.findOne({
        where: { id },
      });

    if (!updatedSupplier) {
      return null;
    }

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Suppliers',
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedSupplier as unknown as Record<string, unknown>,
      description: `Supplier #${id} updated`,
    });

    return updatedSupplier;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingSupplier =
      await this.supplierRepository.findOne({
        where: { id },
      });

    if (!existingSupplier) {
      return;
    }

    await this.supplierRepository.delete(id);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Suppliers',
      recordId: id,
      oldValues:
        existingSupplier as unknown as Record<string, unknown>,
      newValues: null,
      description: `Supplier #${id} deleted`,
    });
  }
}
