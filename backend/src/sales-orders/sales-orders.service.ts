import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SalesOrder } from "./entities/sales-order.entity";

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly salesOrdersRepository: Repository<SalesOrder>,
  ) {}

  async create(
    salesOrderData: Partial<SalesOrder>,
  ): Promise<SalesOrder> {
    const salesOrder =
      this.salesOrdersRepository.create(salesOrderData);

    return this.salesOrdersRepository.save(salesOrder);
  }

  async findAll(): Promise<SalesOrder[]> {
    return this.salesOrdersRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number): Promise<SalesOrder> {
    const salesOrder =
      await this.salesOrdersRepository.findOne({
        where: {
          id,
        },
      });

    if (!salesOrder) {
      throw new NotFoundException(
        `Sales order with ID ${id} not found`,
      );
    }

    return salesOrder;
  }

  async update(
    id: number,
    salesOrderData: Partial<SalesOrder>,
  ): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id);

    Object.assign(salesOrder, salesOrderData);

    return this.salesOrdersRepository.save(salesOrder);
  }

  async remove(id: number): Promise<{ message: string }> {
    const salesOrder = await this.findOne(id);

    await this.salesOrdersRepository.remove(salesOrder);

    return {
      message: `Sales order with ID ${id} deleted successfully`,
    };
  }
}
