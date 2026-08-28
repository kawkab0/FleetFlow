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

import { PurchaseDetailsService } from "./purchase-details.service";
import { PurchaseDetail } from "./entities/purchase-detail.entity";

@Controller("purchase-details")
export class PurchaseDetailsController {
  constructor(
    private readonly purchaseDetailsService: PurchaseDetailsService,
  ) {}

  @Post()
  create(
    @Body() detailData: Partial<PurchaseDetail>,
  ): Promise<PurchaseDetail> {
    return this.purchaseDetailsService.create(detailData);
  }

  @Get()
  findAll(): Promise<PurchaseDetail[]> {
    return this.purchaseDetailsService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<PurchaseDetail> {
    return this.purchaseDetailsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() detailData: Partial<PurchaseDetail>,
  ): Promise<PurchaseDetail> {
    return this.purchaseDetailsService.update(
      id,
      detailData,
    );
  }

  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.purchaseDetailsService.remove(id);
  }
}
