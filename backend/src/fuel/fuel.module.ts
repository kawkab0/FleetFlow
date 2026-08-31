import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FuelController } from './fuel.controller';
import { FuelService } from './fuel.service';
import { Fuel } from './entities/fuel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fuel])],
  controllers: [FuelController],
  providers: [FuelService],
})
export class FuelModule {}
