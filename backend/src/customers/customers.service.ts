import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Customer } from "./entities/customer.entity";

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(customerData: Partial<Customer>): Promise<Customer> {
    const customer = this.customersRepository.create(customerData);

    return this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${id} not found`,
      );
    }

    return customer;
  }

  async update(
    id: number,
    customerData: Partial<Customer>,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    Object.assign(customer, customerData);

    return this.customersRepository.save(customer);
  }

  async remove(id: number): Promise<{ message: string }> {
    const customer = await this.findOne(id);

    await this.customersRepository.remove(customer);

    return {
      message: `Customer with ID ${id} deleted successfully`,
    };
  }
}
