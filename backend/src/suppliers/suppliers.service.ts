import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find();
  }

  async findOne(id: number): Promise<Supplier | null> {
    return this.supplierRepository.findOne({
      where: { id },
    });
  }

  async create(supplier: Partial<Supplier>): Promise<Supplier> {
    const newSupplier = this.supplierRepository.create(supplier);
    return this.supplierRepository.save(newSupplier);
  }

  async update(
    id: number,
    supplier: Partial<Supplier>,
  ): Promise<Supplier | null> {
    await this.supplierRepository.update(id, supplier);

    return this.supplierRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.supplierRepository.delete(id);
  }
}
