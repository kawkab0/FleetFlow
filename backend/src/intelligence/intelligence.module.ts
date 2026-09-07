import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Fuel } from '../fuel/entities/fuel.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      Driver,
      Trip,
      Fuel,
      Maintenance,
      Expense,
    ]),
  ],

  controllers: [IntelligenceController],

  providers: [IntelligenceService],
})
export class IntelligenceModule {}
