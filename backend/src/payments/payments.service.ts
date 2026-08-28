import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Payment } from "./entities/payment.entity";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async create(
    paymentData: Partial<Payment>,
  ): Promise<Payment> {
    const payment =
      this.paymentsRepository.create(paymentData);

    return this.paymentsRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment =
      await this.paymentsRepository.findOne({
        where: {
          id,
        },
      });

    if (!payment) {
      throw new NotFoundException(
        `Payment with ID ${id} not found`,
      );
    }

    return payment;
  }

  async update(
    id: number,
    paymentData: Partial<Payment>,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    Object.assign(payment, paymentData);

    return this.paymentsRepository.save(payment);
  }

  async remove(id: number): Promise<{ message: string }> {
    const payment = await this.findOne(id);

    await this.paymentsRepository.remove(payment);

    return {
      message: `Payment with ID ${id} deleted successfully`,
    };
  }
}
