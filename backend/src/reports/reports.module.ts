import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

import { Trip } from '../trips/entities/trip.entity';
import { Fuel } from '../fuel/entities/fuel.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trip,
      Fuel,
      Maintenance,
      Expense,
    ]),
  ],

  controllers: [ReportsController],

  providers: [ReportsService],

  exports: [ReportsService],
})
export class ReportsModule {}
