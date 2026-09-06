import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trip } from '../trips/entities/trip.entity';
import { Fuel } from '../fuel/entities/fuel.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class ReportsService {
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
  // FLEET REPORT
  // ==========================================

  async getFleetReport() {
    const trips = await this.tripsRepository.find();
    const fuel = await this.fuelRepository.find();
    const maintenance = await this.maintenanceRepository.find();
    const expenses = await this.expensesRepository.find();

    const totalTrips = trips.length;

    const completedTrips = trips.filter(
      (trip) => trip.status === 'Completed',
    ).length;

    const activeTrips = trips.filter(
      (trip) =>
        trip.status === 'In Progress' ||
        trip.status === 'Active',
    ).length;

    const totalDistance = trips.reduce(
      (sum, trip) => sum + Number(trip.distance || 0),
      0,
    );

    const totalRevenue = trips.reduce(
      (sum, trip) => sum + Number(trip.revenue || 0),
      0,
    );

    const totalFuelCost = fuel.reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0,
    );

    const totalMaintenanceCost = maintenance.reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0,
    );

    const totalExpenseCost = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const totalOperatingCost =
      totalFuelCost +
      totalMaintenanceCost +
      totalExpenseCost;

    const netOperatingResult =
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

    return {
      totalTrips,
      completedTrips,
      activeTrips,
      totalDistance,
      totalRevenue,
      totalFuelCost,
      totalMaintenanceCost,
      totalExpenseCost,
      totalOperatingCost,
      netOperatingResult,
      totalFuelLiters,
      fuelEfficiency,
      costPerKm,
      revenuePerKm,
    };
  }

  // ==========================================
  // TRIP REPORT
  // ==========================================

  async getTripReport() {
    const trips = await this.tripsRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return trips.map((trip) => ({
      id: trip.id,
      tripCode: trip.tripCode,
      vehicleCode: trip.vehicleCode,
      driverCode: trip.driverCode,
      origin: trip.origin,
      destination: trip.destination,
      tripDate: trip.tripDate,
      distance: Number(trip.distance || 0),
      fuelUsed: Number(trip.fuelUsed || 0),
      revenue: Number(trip.revenue || 0),
      status: trip.status,
      cargo: trip.cargo,
      notes: trip.notes,
    }));
  }

  // ==========================================
  // FUEL REPORT
  // ==========================================

  async getFuelReport() {
    const fuel = await this.fuelRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return fuel.map((record) => ({
      id: record.id,
      fuelCode: record.fuelCode,
      vehicleCode: record.vehicleCode,
      driverCode: record.driverCode,
      fuelDate: record.fuelDate,
      liters: Number(record.liters || 0),
      cost: Number(record.cost || 0),
      fuelStation: record.fuelStation,
      odometer: Number(record.odometer || 0),
      paymentMethod: record.paymentMethod,
      notes: record.notes,
    }));
  }

  // ==========================================
  // MAINTENANCE REPORT
  // ==========================================

  async getMaintenanceReport() {
    const maintenance = await this.maintenanceRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return maintenance.map((record) => ({
      id: record.id,
      maintenanceCode: record.maintenanceCode,
      vehicleCode: record.vehicleCode,
      maintenanceDate: record.maintenanceDate,
      maintenanceType: record.maintenanceType,
      description: record.description,
      mileage: Number(record.mileage || 0),
      cost: Number(record.cost || 0),
      serviceProvider: record.serviceProvider,
      status: record.status,
      notes: record.notes,
    }));
  }

  // ==========================================
  // EXPENSE REPORT
  // ==========================================

  async getExpenseReport() {
    const expenses = await this.expensesRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      expenseCode: expense.expenseCode,
      vehicleCode: expense.vehicleCode,
      driverCode: expense.driverCode,
      expenseDate: expense.expenseDate,
      category: expense.category,
      description: expense.description,
      amount: Number(expense.amount || 0),
      vendor: expense.vendor,
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      notes: expense.notes,
    }));
  }
}
