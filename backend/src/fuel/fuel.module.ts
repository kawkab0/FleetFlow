import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FuelController } from './fuel.controller';
import { FuelService } from './fuel.service';
import { Fuel } from './entities/fuel.entity';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fuel]),
    AuditLogsModule,
  ],
  controllers: [FuelController],
  providers: [FuelService],
})
export class FuelModule {}
