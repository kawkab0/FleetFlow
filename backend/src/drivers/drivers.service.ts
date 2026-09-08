import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Driver } from './entities/driver.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,

    private readonly auditLogsService: AuditLogsService,
  ) {}

  // =========================
  // GET ALL DRIVERS
  // =========================

  async findAll(): Promise<Driver[]> {
    return this.driversRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  // =========================
  // GET ONE DRIVER
  // =========================

  async findOne(id: number): Promise<Driver> {
    const driver =
      await this.driversRepository.findOne({
        where: { id },
      });

    if (!driver) {
      throw new NotFoundException(
        `Driver with ID ${id} not found`,
      );
    }

    return driver;
  }

  // =========================
  // CREATE DRIVER
  // =========================

  async create(
    driverData: Partial<Driver>,
    user: AuthenticatedUser,
  ): Promise<Driver> {
    const driver =
      this.driversRepository.create(
        driverData,
      );

    const savedDriver =
      await this.driversRepository.save(
        driver,
      );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Drivers',
      recordId: savedDriver.id,
      newValues: {
        ...savedDriver,
      },
      description: `Created driver #${savedDriver.id}`,
    });

    return savedDriver;
  }

  // =========================
  // UPDATE DRIVER
  // =========================

  async update(
    id: number,
    driverData: Partial<Driver>,
    user: AuthenticatedUser,
  ): Promise<Driver> {
    const existingDriver =
      await this.findOne(id);

    const oldValues = {
      ...existingDriver,
    };

    Object.assign(
      existingDriver,
      driverData,
    );

    const updatedDriver =
      await this.driversRepository.save(
        existingDriver,
      );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Drivers',
      recordId: id,
      oldValues,
      newValues: {
        ...updatedDriver,
      },
      description: `Updated driver #${id}`,
    });

    return updatedDriver;
  }

  // =========================
  // DELETE DRIVER
  // =========================

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingDriver =
      await this.findOne(id);

    const oldValues = {
      ...existingDriver,
    };

    await this.driversRepository.remove(
      existingDriver,
    );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Drivers',
      recordId: id,
      oldValues,
      description: `Deleted driver #${id}`,
    });
  }
}
