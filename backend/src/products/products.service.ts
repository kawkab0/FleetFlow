import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly auditLogsService: AuditLogsService,
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

  async create(
    product: Partial<Product>,
    user: AuthenticatedUser,
  ): Promise<Product> {
    const newProduct = this.productRepository.create(product);

    const savedProduct =
      await this.productRepository.save(newProduct);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Products',
      recordId: savedProduct.id,
      oldValues: null,
      newValues: savedProduct as unknown as Record<string, unknown>,
      description: `Product #${savedProduct.id} created`,
    });

    return savedProduct;
  }

  async update(
    id: number,
    product: Partial<Product>,
    user: AuthenticatedUser,
  ): Promise<Product | null> {
    const existingProduct =
      await this.productRepository.findOne({
        where: { id },
      });

    if (!existingProduct) {
      return null;
    }

    const oldValues = {
      ...existingProduct,
    };

    await this.productRepository.update(id, product);

    const updatedProduct =
      await this.productRepository.findOne({
        where: { id },
        relations: {
          supplier: true,
        },
      });

    if (!updatedProduct) {
      return null;
    }

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Products',
      recordId: id,
      oldValues: oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedProduct as unknown as Record<string, unknown>,
      description: `Product #${id} updated`,
    });

    return updatedProduct;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingProduct =
      await this.productRepository.findOne({
        where: { id },
      });

    if (!existingProduct) {
      return;
    }

    await this.productRepository.delete(id);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Products',
      recordId: id,
      oldValues:
        existingProduct as unknown as Record<string, unknown>,
      newValues: null,
      description: `Product #${id} deleted`,
    });
  }
}
