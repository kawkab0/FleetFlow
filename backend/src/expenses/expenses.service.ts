import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Expense } from './entities/expense.entity';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,

    private readonly auditLogsService: AuditLogsService,
  ) {}

  findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<Expense | null> {
    return this.expensesRepository.findOne({
      where: { id },
    });
  }

  async create(
    expense: Partial<Expense>,
    user: AuthenticatedUser,
  ): Promise<Expense> {
    const newExpense =
      this.expensesRepository.create(expense);

    const savedExpense =
      await this.expensesRepository.save(
        newExpense,
      );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'CREATE',
      module: 'Expenses',
      recordId: savedExpense.id,
      newValues: { ...savedExpense },
      description: `Created expense #${savedExpense.id}`,
    });

    return savedExpense;
  }

  async update(
    id: number,
    expense: Partial<Expense>,
    user: AuthenticatedUser,
  ): Promise<Expense | null> {
    const existingExpense =
      await this.findOne(id);

    if (!existingExpense) {
      return null;
    }

    const oldValues = {
      ...existingExpense,
    };

    Object.assign(
      existingExpense,
      expense,
    );

    const updatedExpense =
      await this.expensesRepository.save(
        existingExpense,
      );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Expenses',
      recordId: id,
      oldValues,
      newValues: { ...updatedExpense },
      description: `Updated expense #${id}`,
    });

    return updatedExpense;
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existingExpense =
      await this.findOne(id);

    if (!existingExpense) {
      return;
    }

    const oldValues = {
      ...existingExpense,
    };

    await this.expensesRepository.remove(
      existingExpense,
    );

    await this.auditLogsService.create({
      userId: user.userId,
      userName: user.email,
      userRole: user.role,
      action: 'DELETE',
      module: 'Expenses',
      recordId: id,
      oldValues,
      description: `Deleted expense #${id}`,
    });
  }
}
