import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SalesOrder } from "./entities/sales-order.entity";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly salesOrdersRepository: Repository<SalesOrder>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    salesOrderData: Partial<SalesOrder>,
    user: AuthenticatedUser,
  ): Promise<SalesOrder> {
    const salesOrder =
      this.salesOrdersRepository.create(salesOrderData);

    const savedSalesOrder =
      await this.salesOrdersRepository.save(salesOrder);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "CREATE",
      module: "Sales Orders",
      recordId: savedSalesOrder.id,
      oldValues: null,
      newValues:
        savedSalesOrder as unknown as Record<string, unknown>,
      description:
        `Sales order #${savedSalesOrder.id} created`,
    });

    return savedSalesOrder;
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
    user: AuthenticatedUser,
  ): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id);

    const oldValues = {
      ...salesOrder,
    };

    Object.assign(salesOrder, salesOrderData);

    const updatedSalesOrder =
      await this.salesOrdersRepository.save(salesOrder);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "UPDATE",
      module: "Sales Orders",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedSalesOrder as unknown as Record<string, unknown>,
      description: `Sales order #${id} updated`,
    });

    return updatedSalesOrder;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const salesOrder = await this.findOne(id);

    const oldValues = {
      ...salesOrder,
    };

    await this.salesOrdersRepository.remove(salesOrder);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "DELETE",
      module: "Sales Orders",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues: null,
      description: `Sales order #${id} deleted`,
    });

    return {
      message: `Sales order with ID ${id} deleted successfully`,
    };
  }
}
