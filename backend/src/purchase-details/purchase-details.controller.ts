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

import { PurchaseDetailsService } from './purchase-details.service';
import { PurchaseDetail } from './entities/purchase-detail.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('purchase-details')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseDetailsController {
  constructor(
    private readonly purchaseDetailsService: PurchaseDetailsService,
  ) {}

  @Post()
  @Roles('Admin', 'Finance')
  create(
    @Body() detailData: Partial<PurchaseDetail>,
  ): Promise<PurchaseDetail> {
    return this.purchaseDetailsService.create(detailData);
  }

  @Get()
  @Roles('Admin', 'Finance')
  findAll(): Promise<PurchaseDetail[]> {
    return this.purchaseDetailsService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Finance')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PurchaseDetail> {
    return this.purchaseDetailsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Finance')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() detailData: Partial<PurchaseDetail>,
  ): Promise<PurchaseDetail> {
    return this.purchaseDetailsService.update(
      id,
      detailData,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.purchaseDetailsService.remove(id);
  }
}
