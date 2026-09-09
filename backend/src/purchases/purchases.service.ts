import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Purchase } from "./entities/purchase.entity";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    purchaseData: Partial<Purchase>,
    user: AuthenticatedUser,
  ): Promise<Purchase> {
    const purchase =
      this.purchasesRepository.create(purchaseData);

    const savedPurchase =
      await this.purchasesRepository.save(purchase);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "CREATE",
      module: "Purchases",
      recordId: savedPurchase.id,
      oldValues: null,
      newValues:
        savedPurchase as unknown as Record<string, unknown>,
      description:
        `Purchase #${savedPurchase.id} created`,
    });

    return savedPurchase;
  }

  async findAll(): Promise<Purchase[]> {
    return this.purchasesRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number): Promise<Purchase> {
    const purchase =
      await this.purchasesRepository.findOne({
        where: {
          id,
        },
      });

    if (!purchase) {
      throw new NotFoundException(
        `Purchase with ID ${id} not found`,
      );
    }

    return purchase;
  }

  async update(
    id: number,
    purchaseData: Partial<Purchase>,
    user: AuthenticatedUser,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);

    const oldValues = {
      ...purchase,
    };

    Object.assign(purchase, purchaseData);

    const updatedPurchase =
      await this.purchasesRepository.save(purchase);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "UPDATE",
      module: "Purchases",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedPurchase as unknown as Record<string, unknown>,
      description: `Purchase #${id} updated`,
    });

    return updatedPurchase;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const purchase = await this.findOne(id);

    const oldValues = {
      ...purchase,
    };

    await this.purchasesRepository.remove(purchase);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "DELETE",
      module: "Purchases",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues: null,
      description: `Purchase #${id} deleted`,
    });

    return {
      message: `Purchase with ID ${id} deleted successfully`,
    };
  }
}
