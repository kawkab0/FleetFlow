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

import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';

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
    @Req() req: AuthenticatedRequest,
  ): Promise<Payment> {
    return this.paymentsService.create(
      paymentData,
      req.user,
    );
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
    @Req() req: AuthenticatedRequest,
  ): Promise<Payment> {
    return this.paymentsService.update(
      id,
      paymentData,
      req.user,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.paymentsService.remove(
      id,
      req.user,
    );
  }
}
