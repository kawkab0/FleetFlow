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

import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @Roles('Admin', 'Finance')
  create(
    @Body() paymentData: Partial<Payment>,
  ): Promise<Payment> {
    return this.paymentsService.create(paymentData);
  }

  @Get()
  @Roles('Admin', 'Finance')
  findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Finance')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Payment> {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Finance')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() paymentData: Partial<Payment>,
  ): Promise<Payment> {
    return this.paymentsService.update(
      id,
      paymentData,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.paymentsService.remove(id);
  }
}
