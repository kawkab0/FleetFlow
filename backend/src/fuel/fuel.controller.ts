import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { FuelService } from './fuel.service';
import { Fuel } from './entities/fuel.entity';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@Controller('fuel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FuelController {
  constructor(
    private readonly fuelService: FuelService,
  ) {}

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll(): Promise<Fuel[]> {
    return this.fuelService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Fuel | null> {
    return this.fuelService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  create(
    @Body() fuel: CreateFuelDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Fuel> {
    return this.fuelService.create(
      fuel,
      request.user,
    );
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() fuel: UpdateFuelDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Fuel | null> {
    return this.fuelService.update(
      id,
      fuel,
      request.user,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.fuelService.remove(
      id,
      request.user,
    );
  }
}
