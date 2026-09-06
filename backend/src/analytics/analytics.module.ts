import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

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

  controllers: [AnalyticsController],

  providers: [AnalyticsService],

  exports: [AnalyticsService],
})
export class AnalyticsModule {}

