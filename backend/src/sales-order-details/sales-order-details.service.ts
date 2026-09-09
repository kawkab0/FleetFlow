import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SalesOrderDetail } from "./entities/sales-order-detail.entity";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class SalesOrderDetailsService {
  constructor(
    @InjectRepository(SalesOrderDetail)
    private readonly salesOrderDetailsRepository: Repository<SalesOrderDetail>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    detailData: Partial<SalesOrderDetail>,
    user: AuthenticatedUser,
  ): Promise<SalesOrderDetail> {
    const detail =
      this.salesOrderDetailsRepository.create(detailData);

    const savedDetail =
      await this.salesOrderDetailsRepository.save(detail);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "CREATE",
      module: "Sales Order Details",
      recordId: savedDetail.id,
      oldValues: null,
      newValues:
        savedDetail as unknown as Record<string, unknown>,
      description:
        `Sales order detail #${savedDetail.id} created`,
    });

    return savedDetail;
  }

  async findAll(): Promise<SalesOrderDetail[]> {
    return this.salesOrderDetailsRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number): Promise<SalesOrderDetail> {
    const detail =
      await this.salesOrderDetailsRepository.findOne({
        where: {
          id,
        },
      });

    if (!detail) {
      throw new NotFoundException(
        `Sales order detail with ID ${id} not found`,
      );
    }

    return detail;
  }

  async update(
    id: number,
    detailData: Partial<SalesOrderDetail>,
    user: AuthenticatedUser,
  ): Promise<SalesOrderDetail> {
    const detail = await this.findOne(id);

    const oldValues = {
      ...detail,
    };

    Object.assign(detail, detailData);

    const updatedDetail =
      await this.salesOrderDetailsRepository.save(detail);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "UPDATE",
      module: "Sales Order Details",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedDetail as unknown as Record<string, unknown>,
      description:
        `Sales order detail #${id} updated`,
    });

    return updatedDetail;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const detail = await this.findOne(id);

    const oldValues = {
      ...detail,
    };

    await this.salesOrderDetailsRepository.remove(detail);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "DELETE",
      module: "Sales Order Details",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues: null,
      description:
        `Sales order detail #${id} deleted`,
    });

    return {
      message:
        `Sales order detail with ID ${id} deleted successfully`,
    };
  }
}
