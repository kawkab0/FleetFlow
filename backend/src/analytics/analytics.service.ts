import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trip } from '../trips/entities/trip.entity';
import { Fuel } from '../fuel/entities/fuel.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,

    @InjectRepository(Fuel)
    private readonly fuelRepository: Repository<Fuel>,

    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,

    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
  ) {}

  // ==========================================
  // FLEET KPIs
  // ==========================================

  async getFleetKpis() {
    const trips = await this.tripsRepository.find();
    const fuel = await this.fuelRepository.find();
    const maintenance = await this.maintenanceRepository.find();
    const expenses = await this.expensesRepository.find();

    const totalTrips = trips.length;

    const completedTrips = trips.filter(
      (trip) => trip.status === 'Completed',
    ).length;

    const plannedTrips = trips.filter(
      (trip) => trip.status === 'Planned',
    ).length;

    const activeTrips = trips.filter(
      (trip) =>
        trip.status === 'Active' ||
        trip.status === 'In Progress',
    ).length;

    const totalDistance = trips.reduce(
      (sum, trip) => sum + Number(trip.distance || 0),
      0,
    );

    const totalRevenue = trips.reduce(
      (sum, trip) => sum + Number(trip.revenue || 0),
      0,
    );

    const fuelCost = fuel.reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0,
    );

    const maintenanceCost = maintenance.reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0,
    );

    const expenseCost = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const totalOperatingCost =
      fuelCost +
      maintenanceCost +
      expenseCost;

    const profit =
      totalRevenue - totalOperatingCost;

    const totalFuelLiters = fuel.reduce(
      (sum, record) => sum + Number(record.liters || 0),
      0,
    );

    const fuelEfficiency =
      totalFuelLiters > 0
        ? totalDistance / totalFuelLiters
        : 0;

    const costPerKm =
      totalDistance > 0
        ? totalOperatingCost / totalDistance
        : 0;

    const revenuePerKm =
      totalDistance > 0
        ? totalRevenue / totalDistance
        : 0;

    const profitMargin =
      totalRevenue > 0
        ? (profit / totalRevenue) * 100
        : 0;

    const completionRate =
      totalTrips > 0
        ? (completedTrips / totalTrips) * 100
        : 0;

    return {
      totalTrips,
      completedTrips,
      plannedTrips,
      activeTrips,
      completionRate,
      totalDistance,
      totalRevenue,
      fuelCost,
      maintenanceCost,
      expenseCost,
      totalOperatingCost,
      profit,
      profitMargin,
      totalFuelLiters,
      fuelEfficiency,
      costPerKm,
      revenuePerKm,
    };
  }

  // ==========================================
  // VEHICLE ANALYTICS
  // ==========================================

  async getVehicleAnalytics() {
    const trips = await this.tripsRepository.find();
    const fuel = await this.fuelRepository.find();
    const maintenance = await this.maintenanceRepository.find();
    const expenses = await this.expensesRepository.find();

    const vehicleCodes = new Set<string>();

    trips.forEach((trip) => {
      vehicleCodes.add(trip.vehicleCode);
    });

    fuel.forEach((record) => {
      vehicleCodes.add(record.vehicleCode);
    });

    maintenance.forEach((record) => {
      vehicleCodes.add(record.vehicleCode);
    });

    expenses.forEach((expense) => {
      vehicleCodes.add(expense.vehicleCode);
    });

    return Array.from(vehicleCodes).map((vehicleCode) => {
      const vehicleTrips = trips.filter(
        (trip) => trip.vehicleCode === vehicleCode,
      );

      const vehicleFuel = fuel.filter(
        (record) => record.vehicleCode === vehicleCode,
      );

      const vehicleMaintenance = maintenance.filter(
        (record) => record.vehicleCode === vehicleCode,
      );

      const vehicleExpenses = expenses.filter(
        (expense) => expense.vehicleCode === vehicleCode,
      );

      const tripsCount = vehicleTrips.length;

      const completedTrips = vehicleTrips.filter(
        (trip) => trip.status === 'Completed',
      ).length;

      const distance = vehicleTrips.reduce(
        (sum, trip) => sum + Number(trip.distance || 0),
        0,
      );

      const revenue = vehicleTrips.reduce(
        (sum, trip) => sum + Number(trip.revenue || 0),
        0,
      );

      const fuelLiters = vehicleFuel.reduce(
        (sum, record) => sum + Number(record.liters || 0),
        0,
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, record) => sum + Number(record.cost || 0),
        0,
      );

      const maintenanceCost = vehicleMaintenance.reduce(
        (sum, record) => sum + Number(record.cost || 0),
        0,
      );

      const expenseCost = vehicleExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0,
      );

      const totalCost =
        fuelCost +
        maintenanceCost +
        expenseCost;

      const profit = revenue - totalCost;

      const fuelEfficiency =
        fuelLiters > 0
          ? distance / fuelLiters
          : 0;

      const costPerKm =
        distance > 0
          ? totalCost / distance
          : 0;

      const revenuePerKm =
        distance > 0
          ? revenue / distance
          : 0;

      const profitMargin =
        revenue > 0
          ? (profit / revenue) * 100
          : 0;

      return {
        vehicleCode,
        tripsCount,
        completedTrips,
        distance,
        revenue,
        fuelLiters,
        fuelCost,
        maintenanceCost,
        expenseCost,
        totalCost,
        profit,
        profitMargin,
        fuelEfficiency,
        costPerKm,
        revenuePerKm,
      };
    });
  }

  // ==========================================
  // EXPENSE BREAKDOWN
  // ==========================================

  async getExpenseBreakdown() {
    const expenses = await this.expensesRepository.find();

    const categories = new Map<string, number>();

    expenses.forEach((expense) => {
      const category = expense.category;

      const currentAmount =
        categories.get(category) || 0;

      categories.set(
        category,
        currentAmount + Number(expense.amount || 0),
      );
    });

    return Array.from(categories.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
      }),
    );
  }

  // ==========================================
  // MONTHLY ANALYTICS
  // ==========================================

  async getMonthlyAnalytics() {
    const trips = await this.tripsRepository.find();
    const fuel = await this.fuelRepository.find();
    const maintenance = await this.maintenanceRepository.find();
    const expenses = await this.expensesRepository.find();

    const months = new Map<
      string,
      {
        trips: number;
        distance: number;
        revenue: number;
        fuelCost: number;
        maintenanceCost: number;
        expenseCost: number;
      }
    >();

    trips.forEach((trip) => {
      const month = trip.tripDate.substring(0, 7);

      if (!months.has(month)) {
        months.set(month, {
          trips: 0,
          distance: 0,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          expenseCost: 0,
        });
      }

      const data = months.get(month)!;

      data.trips += 1;
      data.distance += Number(trip.distance || 0);
      data.revenue += Number(trip.revenue || 0);
    });

    fuel.forEach((record) => {
      const month = record.fuelDate.substring(0, 7);

      if (!months.has(month)) {
        months.set(month, {
          trips: 0,
          distance: 0,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          expenseCost: 0,
        });
      }

      months.get(month)!.fuelCost +=
        Number(record.cost || 0);
    });

    maintenance.forEach((record) => {
      const month =
        record.maintenanceDate.substring(0, 7);

      if (!months.has(month)) {
        months.set(month, {
          trips: 0,
          distance: 0,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          expenseCost: 0,
        });
      }

      months.get(month)!.maintenanceCost +=
        Number(record.cost || 0);
    });

    expenses.forEach((expense) => {
      const month =
        expense.expenseDate.substring(0, 7);

      if (!months.has(month)) {
        months.set(month, {
          trips: 0,
          distance: 0,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          expenseCost: 0,
        });
      }

      months.get(month)!.expenseCost +=
        Number(expense.amount || 0);
    });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => {
        const totalCost =
          data.fuelCost +
          data.maintenanceCost +
          data.expenseCost;

        const profit =
          data.revenue - totalCost;

        const costPerKm =
          data.distance > 0
            ? totalCost / data.distance
            : 0;

        const revenuePerKm =
          data.distance > 0
            ? data.revenue / data.distance
            : 0;

        return {
          month,
          trips: data.trips,
          distance: data.distance,
          revenue: data.revenue,
          fuelCost: data.fuelCost,
          maintenanceCost: data.maintenanceCost,
          expenseCost: data.expenseCost,
          totalCost,
          profit,
          costPerKm,
          revenuePerKm,
        };
      });
  }
}
