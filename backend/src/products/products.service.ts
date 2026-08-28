import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: {
        supplier: true,
      },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: {
        supplier: true,
      },
    });
  }

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.productRepository.create(product);

    return this.productRepository.save(newProduct);
  }

  async update(
    id: number,
    product: Partial<Product>,
  ): Promise<Product | null> {
    await this.productRepository.update(id, product);

    return this.productRepository.findOne({
      where: { id },
      relations: {
        supplier: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}
