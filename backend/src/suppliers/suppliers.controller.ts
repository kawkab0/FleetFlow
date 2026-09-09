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

import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';

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

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
  ) {}

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Finance')
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Finance')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager', 'Finance')
  create(
    @Body() supplier: Partial<Supplier>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.create(
      supplier,
      req.user,
    );
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager', 'Finance')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() supplier: Partial<Supplier>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.update(
      id,
      supplier,
      req.user,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.remove(id, req.user);
  }
}
