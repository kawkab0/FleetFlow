import { Module } from '@nestjs/common';

import { VehiclesModule } from '../vehicles/vehicles.module';

import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';

@Module({
  imports: [VehiclesModule],
  providers: [ImportsService],
  controllers: [ImportsController],
})
export class ImportsModule {}
