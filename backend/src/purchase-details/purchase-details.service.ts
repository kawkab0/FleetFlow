import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PurchaseDetail } from "./entities/purchase-detail.entity";

@Injectable()
export class PurchaseDetailsService {
  constructor(
    @InjectRepository(PurchaseDetail)
    private readonly purchaseDetailsRepository: Repository<PurchaseDetail>,
  ) {}

  async create(
    detailData: Partial<PurchaseDetail>,
  ): Promise<PurchaseDetail> {
    const detail =
      this.purchaseDetailsRepository.create(detailData);

    return this.purchaseDetailsRepository.save(detail);
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
  ): Promise<PurchaseDetail> {
    const detail = await this.findOne(id);

    Object.assign(detail, detailData);

    return this.purchaseDetailsRepository.save(detail);
  }

  async remove(id: number): Promise<{ message: string }> {
    const detail = await this.findOne(id);

    await this.purchaseDetailsRepository.remove(detail);

    return {
      message: `Purchase detail with ID ${id} deleted successfully`,
    };
  }
}
