import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
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

  create(expense: Partial<Expense>): Promise<Expense> {
    const newExpense = this.expensesRepository.create(expense);

    return this.expensesRepository.save(newExpense);
  }

  async update(
    id: number,
    expense: Partial<Expense>,
  ): Promise<Expense | null> {
    const existingExpense = await this.findOne(id);

    if (!existingExpense) {
      return null;
    }

    Object.assign(existingExpense, expense);

    return this.expensesRepository.save(existingExpense);
  }

  async remove(id: number): Promise<void> {
    await this.expensesRepository.delete(id);
  }
}
