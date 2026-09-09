import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PurchaseDetail } from "./entities/purchase-detail.entity";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class PurchaseDetailsService {
  constructor(
    @InjectRepository(PurchaseDetail)
    private readonly purchaseDetailsRepository: Repository<PurchaseDetail>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    detailData: Partial<PurchaseDetail>,
    user: AuthenticatedUser,
  ): Promise<PurchaseDetail> {
    const detail =
      this.purchaseDetailsRepository.create(detailData);

    const savedDetail =
      await this.purchaseDetailsRepository.save(detail);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "CREATE",
      module: "Purchase Details",
      recordId: savedDetail.id,
      oldValues: null,
      newValues:
        savedDetail as unknown as Record<string, unknown>,
      description:
        `Purchase detail #${savedDetail.id} created`,
    });

    return savedDetail;
  }

  async findAll(): Promise<PurchaseDetail[]> {
    return this.purchaseDetailsRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number): Promise<PurchaseDetail> {
    const detail =
      await this.purchaseDetailsRepository.findOne({
        where: {
          id,
        },
      });

    if (!detail) {
      throw new NotFoundException(
        `Purchase detail with ID ${id} not found`,
      );
    }

    return detail;
  }

  async update(
    id: number,
    detailData: Partial<PurchaseDetail>,
    user: AuthenticatedUser,
  ): Promise<PurchaseDetail> {
    const detail = await this.findOne(id);

    const oldValues = {
      ...detail,
    };

    Object.assign(detail, detailData);

    const updatedDetail =
      await this.purchaseDetailsRepository.save(detail);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "UPDATE",
      module: "Purchase Details",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedDetail as unknown as Record<string, unknown>,
      description:
        `Purchase detail #${id} updated`,
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

    await this.purchaseDetailsRepository.remove(detail);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "DELETE",
      module: "Purchase Details",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues: null,
      description:
        `Purchase detail #${id} deleted`,
    });

    return {
      message:
        `Purchase detail with ID ${id} deleted successfully`,
    };
  }
}
