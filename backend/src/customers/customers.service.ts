import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Customer } from "./entities/customer.entity";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    customerData: Partial<Customer>,
    user: AuthenticatedUser,
  ): Promise<Customer> {
    const customer =
      this.customersRepository.create(customerData);

    const savedCustomer =
      await this.customersRepository.save(customer);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "CREATE",
      module: "Customers",
      recordId: savedCustomer.id,
      oldValues: null,
      newValues:
        savedCustomer as unknown as Record<string, unknown>,
      description: `Customer #${savedCustomer.id} created`,
    });

    return savedCustomer;
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer =
      await this.customersRepository.findOne({
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
    user: AuthenticatedUser,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    const oldValues = {
      ...customer,
    };

    Object.assign(customer, customerData);

    const updatedCustomer =
      await this.customersRepository.save(customer);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "UPDATE",
      module: "Customers",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedCustomer as unknown as Record<string, unknown>,
      description: `Customer #${id} updated`,
    });

    return updatedCustomer;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const customer = await this.findOne(id);

    const oldValues = {
      ...customer,
    };

    await this.customersRepository.remove(customer);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "DELETE",
      module: "Customers",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues: null,
      description: `Customer #${id} deleted`,
    });

    return {
      message: `Customer with ID ${id} deleted successfully`,
    };
  }
}
