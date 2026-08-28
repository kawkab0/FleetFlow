import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";

import { PurchasesService } from "./purchases.service";
import { Purchase } from "./entities/purchase.entity";

@Controller("purchases")
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
  ) {}

  @Post()
  create(
    @Body() purchaseData: Partial<Purchase>,
  ): Promise<Purchase> {
    return this.purchasesService.create(purchaseData);
  }

  @Get()
  findAll(): Promise<Purchase[]> {
    return this.purchasesService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Purchase> {
    return this.purchasesService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() purchaseData: Partial<Purchase>,
  ): Promise<Purchase> {
    return this.purchasesService.update(id, purchaseData);
  }

  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.purchasesService.remove(id);
  }
}
