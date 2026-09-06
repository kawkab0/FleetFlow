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

import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll(): Promise<Inventory[]> {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Inventory | null> {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  create(
    @Body() data: Partial<Inventory>,
  ): Promise<Inventory> {
    return this.inventoryService.create(data);
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Inventory>,
  ): Promise<Inventory | null> {
    return this.inventoryService.update(id, data);
  }

  @Delete(':id')
  @Roles('Admin')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const deleted = await this.inventoryService.remove(id);

    return {
      success: deleted,
    };
  }
}
