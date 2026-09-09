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

import { ExpensesService } from './expenses.service';
import { Expense } from './entities/expense.entity';

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

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
  ) {}

  @Get()
  @Roles('Admin', 'Finance')
  findAll(): Promise<Expense[]> {
    return this.expensesService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Finance')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Expense | null> {
    return this.expensesService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Finance')
  create(
    @Body() expense: Partial<Expense>,
    @Req() request: AuthenticatedRequest,
  ): Promise<Expense> {
    return this.expensesService.create(
      expense,
      request.user,
    );
  }

  @Patch(':id')
  @Roles('Admin', 'Finance')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() expense: Partial<Expense>,
    @Req() request: AuthenticatedRequest,
  ): Promise<Expense | null> {
    return this.expensesService.update(
      id,
      expense,
      request.user,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.expensesService.remove(
      id,
      request.user,
    );
  }
}
