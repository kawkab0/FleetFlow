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

import { SalesOrderDetailsService } from './sales-order-details.service';
import { SalesOrderDetail } from './entities/sales-order-detail.entity';

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

@Controller('sales-order-details')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesOrderDetailsController {
  constructor(
    private readonly salesOrderDetailsService: SalesOrderDetailsService,
  ) {}

  @Post()
  @Roles('Admin', 'Finance', 'Operations')
  create(
    @Body() detailData: Partial<SalesOrderDetail>,
    @Req() req: AuthenticatedRequest,
  ): Promise<SalesOrderDetail> {
    return this.salesOrderDetailsService.create(
      detailData,
      req.user,
    );
  }

  @Get()
  @Roles('Admin', 'Finance', 'Operations')
  findAll(): Promise<SalesOrderDetail[]> {
    return this.salesOrderDetailsService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Finance', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SalesOrderDetail> {
    return this.salesOrderDetailsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Finance', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() detailData: Partial<SalesOrderDetail>,
    @Req() req: AuthenticatedRequest,
  ): Promise<SalesOrderDetail> {
    return this.salesOrderDetailsService.update(
      id,
      detailData,
      req.user,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.salesOrderDetailsService.remove(
      id,
      req.user,
    );
  }
}
