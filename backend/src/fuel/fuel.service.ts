import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fuel } from './entities/fuel.entity';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class FuelService {
  constructor(
    @InjectRepository(Fuel)
    private readonly fuelRepository: Repository<Fuel>,

    private readonly auditLogsService: AuditLogsService,
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

  async create(
    fuel: CreateFuelDto,
    user: AuthenticatedUser,
  ): Promise<Fuel> {
    const newFuel =
      this.fuelRepository.create(fuel);

    const savedFuel =
      await this.fuelRepository.save(newFuel);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Fuel',
      recordId: savedFuel.id,
      newValues: { ...savedFuel },
      description: `Created fuel record #${savedFuel.id}`,
    });

    return savedFuel;
  }

  async update(
    id: number,
    fuel: UpdateFuelDto,
    user: AuthenticatedUser,
  ): Promise<Fuel | null> {
    const existingFuel =
      await this.findOne(id);

    if (!existingFuel) {
      return null;
    }

    const oldValues = {
      ...existingFuel,
    };

    Object.assign(existingFuel, fuel);

    const updatedFuel =
      await this.fuelRepository.save(
        existingFuel,
      );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Fuel',
      recordId: id,
      oldValues,
      newValues: { ...updatedFuel },
      description: `Updated fuel record #${id}`,
    });

    return updatedFuel;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingFuel =
      await this.findOne(id);

    if (!existingFuel) {
      return;
    }

    const oldValues = {
      ...existingFuel,
    };

    await this.fuelRepository.remove(
      existingFuel,
    );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Fuel',
      recordId: id,
      oldValues,
      description: `Deleted fuel record #${id}`,
    });
  }
}
