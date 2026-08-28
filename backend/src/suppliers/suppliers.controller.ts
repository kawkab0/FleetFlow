import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(Number(id));
  }

  @Post()
  create(@Body() supplier: Partial<Supplier>) {
    return this.suppliersService.create(supplier);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() supplier: Partial<Supplier>,
  ) {
    return this.suppliersService.update(Number(id), supplier);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(Number(id));
  }
}

