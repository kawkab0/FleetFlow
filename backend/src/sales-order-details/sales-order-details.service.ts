import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SalesOrderDetail } from "./entities/sales-order-detail.entity";

@Injectable()
export class SalesOrderDetailsService {
  constructor(
    @InjectRepository(SalesOrderDetail)
    private readonly salesOrderDetailsRepository: Repository<SalesOrderDetail>,
  ) {}

  async create(
    detailData: Partial<SalesOrderDetail>,
  ): Promise<SalesOrderDetail> {
    const detail =
      this.salesOrderDetailsRepository.create(detailData);

    return this.salesOrderDetailsRepository.save(detail);
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
  ): Promise<SalesOrderDetail> {
    const detail = await this.findOne(id);

    Object.assign(detail, detailData);

    return this.salesOrderDetailsRepository.save(detail);
  }

  async remove(id: number): Promise<{ message: string }> {
    const detail = await this.findOne(id);

    await this.salesOrderDetailsRepository.remove(detail);

    return {
      message: `Sales order detail with ID ${id} deleted successfully`,
    };
  }
}
