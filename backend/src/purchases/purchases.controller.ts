import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { PurchasesService } from './purchases.service';
import { Purchase } from './entities/purchase.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
  ) {}

  @Post()
  @Roles('Admin', 'Finance')
  create(
    @Body() purchaseData: Partial<Purchase>,
  ): Promise<Purchase> {
    return this.purchasesService.create(purchaseData);
  }

  @Get()
  @Roles('Admin', 'Finance')
  findAll(): Promise<Purchase[]> {
    return this.purchasesService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Finance')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Purchase> {
    return this.purchasesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Finance')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() purchaseData: Partial<Purchase>,
  ): Promise<Purchase> {
    return this.purchasesService.update(id, purchaseData);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.purchasesService.remove(id);
  }
}
