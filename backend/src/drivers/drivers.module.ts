import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { Driver } from './entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Driver,
      Vehicle,
    ]),
    AuditLogsModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [
    DriversService,
    TypeOrmModule,
  ],
})
export class DriversModule {}
