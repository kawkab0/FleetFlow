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

import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Product | null> {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  create(
    @Body() product: Partial<Product>,
  ): Promise<Product> {
    return this.productsService.create(product);
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() product: Partial<Product>,
  ): Promise<Product | null> {
    return this.productsService.update(id, product);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.productsService.remove(id);
  }
}
