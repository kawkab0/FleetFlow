import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Payment } from "./entities/payment.entity";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    paymentData: Partial<Payment>,
    user: AuthenticatedUser,
  ): Promise<Payment> {
    const payment =
      this.paymentsRepository.create(paymentData);

    const savedPayment =
      await this.paymentsRepository.save(payment);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "CREATE",
      module: "Payments",
      recordId: savedPayment.id,
      oldValues: null,
      newValues:
        savedPayment as unknown as Record<string, unknown>,
      description:
        `Payment #${savedPayment.id} created`,
    });

    return savedPayment;
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
    user: AuthenticatedUser,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    const oldValues = {
      ...payment,
    };

    Object.assign(payment, paymentData);

    const updatedPayment =
      await this.paymentsRepository.save(payment);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "UPDATE",
      module: "Payments",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues:
        updatedPayment as unknown as Record<string, unknown>,
      description: `Payment #${id} updated`,
    });

    return updatedPayment;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const payment = await this.findOne(id);

    const oldValues = {
      ...payment,
    };

    await this.paymentsRepository.remove(payment);

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: "DELETE",
      module: "Payments",
      recordId: id,
      oldValues:
        oldValues as unknown as Record<string, unknown>,
      newValues: null,
      description: `Payment #${id} deleted`,
    });

    return {
      message: `Payment with ID ${id} deleted successfully`,
    };
  }
}
