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

import { PaymentsService } from "./payments.service";
import { Payment } from "./entities/payment.entity";

@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  create(
    @Body() paymentData: Partial<Payment>,
  ): Promise<Payment> {
    return this.paymentsService.create(paymentData);
  }

  @Get()
  findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Payment> {
    return this.paymentsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() paymentData: Partial<Payment>,
  ): Promise<Payment> {
    return this.paymentsService.update(
      id,
      paymentData,
    );
  }

  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.paymentsService.remove(id);
  }
}
