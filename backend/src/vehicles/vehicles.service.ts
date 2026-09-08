import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vehicle } from './entities/vehicle.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,

    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({
      relations: {
        driver: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Vehicle | null> {
    return this.vehiclesRepository.findOne({
      where: { id },
      relations: {
        driver: true,
      },
    });
  }

  async create(
    vehicleData: Partial<Vehicle>,
    user: AuthenticatedUser,
  ): Promise<Vehicle> {
    const vehicle =
      this.vehiclesRepository.create(vehicleData);

    const savedVehicle =
      await this.vehiclesRepository.save(vehicle);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Vehicles',
      recordId: savedVehicle.id,
      newValues: this.sanitizeVehicle(savedVehicle),
      description: `Created vehicle ${savedVehicle.vehicleCode}`,
    });

    return savedVehicle;
  }

  async update(
    id: number,
    vehicleData: Partial<Vehicle>,
    user: AuthenticatedUser,
  ): Promise<Vehicle | null> {
    const existingVehicle = await this.findOne(id);

    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const oldValues =
      this.sanitizeVehicle(existingVehicle);

    await this.vehiclesRepository.update(
      id,
      vehicleData,
    );

    const updatedVehicle = await this.findOne(id);

    if (!updatedVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Vehicles',
      recordId: id,
      oldValues,
      newValues: this.sanitizeVehicle(updatedVehicle),
      description: `Updated vehicle ${updatedVehicle.vehicleCode}`,
    });

    return updatedVehicle;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingVehicle = await this.findOne(id);

    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const oldValues =
      this.sanitizeVehicle(existingVehicle);

    await this.vehiclesRepository.delete(id);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Vehicles',
      recordId: id,
      oldValues,
      description: `Deleted vehicle ${existingVehicle.vehicleCode}`,
    });
  }

  private sanitizeVehicle(
    vehicle: Vehicle,
  ): Record<string, unknown> {
    return {
      id: vehicle.id,
      vehicleCode: vehicle.vehicleCode,
      registrationNumber:
        vehicle.registrationNumber,
      type: vehicle.type,
      model: vehicle.model,
      status: vehicle.status,
      mileage: vehicle.mileage,
      driverId: vehicle.driver?.id ?? null,
    };
  }
}
