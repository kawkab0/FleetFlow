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

import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

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

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  @Post()
  @Roles('Admin', 'Finance', 'Operations')
  create(
    @Body() customerData: Partial<Customer>,
    @Req() req: AuthenticatedRequest,
  ): Promise<Customer> {
    return this.customersService.create(
      customerData,
      req.user,
    );
  }

  @Get()
  @Roles('Admin', 'Finance', 'Operations')
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Finance', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Finance', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() customerData: Partial<Customer>,
    @Req() req: AuthenticatedRequest,
  ): Promise<Customer> {
    return this.customersService.update(
      id,
      customerData,
      req.user,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.customersService.remove(
      id,
      req.user,
    );
  }
}
