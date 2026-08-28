import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Purchase } from "./entities/purchase.entity";

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
  ) {}

  async create(
    purchaseData: Partial<Purchase>,
  ): Promise<Purchase> {
    const purchase =
      this.purchasesRepository.create(purchaseData);

    return this.purchasesRepository.save(purchase);
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
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);

    Object.assign(purchase, purchaseData);

    return this.purchasesRepository.save(purchase);
  }

  async remove(id: number): Promise<{ message: string }> {
    const purchase = await this.findOne(id);

    await this.purchasesRepository.remove(purchase);

    return {
      message: `Purchase with ID ${id} deleted successfully`,
    };
  }
}
