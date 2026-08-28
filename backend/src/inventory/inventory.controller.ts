import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { Inventory } from "./entities/inventory.entity";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(): Promise<Inventory[]> {
    return this.inventoryService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Inventory | null> {
    return this.inventoryService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Partial<Inventory>): Promise<Inventory> {
    return this.inventoryService.create(data);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() data: Partial<Inventory>,
  ): Promise<Inventory | null> {
    return this.inventoryService.update(Number(id), data);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    const deleted = await this.inventoryService.remove(Number(id));

    return {
      success: deleted,
    };
  }
}
