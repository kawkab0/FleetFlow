import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Inventory } from "./entities/inventory.entity";

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      relations: {
        product: true,
        warehouse: true,
      },
    });
  }

  async findOne(id: number): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({
      where: { id },
      relations: {
        product: true,
        warehouse: true,
      },
    });
  }

  async create(data: Partial<Inventory>): Promise<Inventory> {
    const inventory = this.inventoryRepository.create(data);

    return this.inventoryRepository.save(inventory);
  }

  async update(
    id: number,
    data: Partial<Inventory>,
  ): Promise<Inventory | null> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });

    if (!inventory) {
      return null;
    }

    Object.assign(inventory, data);

    return this.inventoryRepository.save(inventory);
  }

  async remove(id: number): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });

    if (!inventory) {
      return false;
    }

    await this.inventoryRepository.remove(inventory);

    return true;
  }
}
