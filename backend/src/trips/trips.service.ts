import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trip } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,

    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    createTripDto: CreateTripDto,
    user: AuthenticatedUser,
  ): Promise<Trip> {
    const trip =
      this.tripsRepository.create(
        createTripDto,
      );

    const savedTrip =
      await this.tripsRepository.save(trip);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Trips',
      recordId: savedTrip.id,
      newValues: { ...savedTrip },
      description: `Created trip #${savedTrip.id}`,
    });

    return savedTrip;
  }

  async findAll(): Promise<Trip[]> {
    return this.tripsRepository.find({
      order: {
        tripDate: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Trip> {
    const trip =
      await this.tripsRepository.findOne({
        where: { id },
      });

    if (!trip) {
      throw new NotFoundException(
        `Trip with ID ${id} not found`,
      );
    }

    return trip;
  }

  async update(
    id: number,
    updateTripDto: UpdateTripDto,
    user: AuthenticatedUser,
  ): Promise<Trip> {
    const existingTrip =
      await this.findOne(id);

    const oldValues = {
      ...existingTrip,
    };

    Object.assign(
      existingTrip,
      updateTripDto,
    );

    const updatedTrip =
      await this.tripsRepository.save(
        existingTrip,
      );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Trips',
      recordId: id,
      oldValues,
      newValues: { ...updatedTrip },
      description: `Updated trip #${id}`,
    });

    return updatedTrip;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingTrip =
      await this.findOne(id);

    const oldValues = {
      ...existingTrip,
    };

    await this.tripsRepository.remove(
      existingTrip,
    );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Trips',
      recordId: id,
      oldValues,
      description: `Deleted trip #${id}`,
    });
  }
}
