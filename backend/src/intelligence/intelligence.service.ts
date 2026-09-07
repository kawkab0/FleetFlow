import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Fuel } from '../fuel/entities/fuel.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class IntelligenceService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,

    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,

    @InjectRepository(Fuel)
    private readonly fuelRepository: Repository<Fuel>,

    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,

    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getIntelligence() {
    const [
      vehicles,
      drivers,
      trips,
      fuelRecords,
      maintenanceRecords,
      expenses,
    ] = await Promise.all([
      this.vehicleRepository.find(),
      this.driverRepository.find(),
      this.tripRepository.find(),
      this.fuelRepository.find(),
      this.maintenanceRepository.find(),
      this.expenseRepository.find(),
    ]);

    const totalRevenue = trips.reduce(
      (sum, trip) => sum + Number(trip.revenue || 0),
      0,
    );

    const totalFuelCost = fuelRecords.reduce(
      (sum, fuel) => sum + Number(fuel.cost || 0),
      0,
    );

    const totalMaintenanceCost = maintenanceRecords.reduce(
      (sum, maintenance) => sum + Number(maintenance.cost || 0),
      0,
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const totalCost =
      totalFuelCost + totalMaintenanceCost + totalExpenses;

    const profit = totalRevenue - totalCost;

    return {
      summary: {
        totalVehicles: vehicles.length,
        totalDrivers: drivers.length,
        totalTrips: trips.length,
        totalRevenue,
        totalCost,
        profit,
        profitMargin:
          totalRevenue > 0
            ? Number(((profit / totalRevenue) * 100).toFixed(2))
            : 0,
      },

      fleet: {
        activeVehicles: vehicles.filter(
          (vehicle) => vehicle.status === 'Available',
        ).length,

        maintenanceVehicles: vehicles.filter(
          (vehicle) => vehicle.status === 'Maintenance',
        ).length,

        activeDrivers: drivers.filter(
          (driver) => driver.status === 'Active',
        ).length,
      },

      costs: {
        fuel: totalFuelCost,
        maintenance: totalMaintenanceCost,
        otherExpenses: totalExpenses,
      },

      insights: [
        profit >= 0
          ? 'Fleet operations are currently profitable.'
          : 'Fleet operations are currently operating at a loss.',

        totalFuelCost > totalRevenue * 0.25
          ? 'Fuel costs are relatively high compared with revenue.'
          : 'Fuel costs are within a reasonable range.',

        totalMaintenanceCost > totalRevenue * 0.2
          ? 'Maintenance costs require management attention.'
          : 'Maintenance costs are currently under control.',
      ],
    };
  }

  async getProfitability() {
    const [trips, fuelRecords, maintenanceRecords, expenses] =
      await Promise.all([
        this.tripRepository.find(),
        this.fuelRepository.find(),
        this.maintenanceRepository.find(),
        this.expenseRepository.find(),
      ]);

    const revenue = trips.reduce(
      (sum, trip) => sum + Number(trip.revenue || 0),
      0,
    );

    const fuelCost = fuelRecords.reduce(
      (sum, fuel) => sum + Number(fuel.cost || 0),
      0,
    );

    const maintenanceCost = maintenanceRecords.reduce(
      (sum, maintenance) => sum + Number(maintenance.cost || 0),
      0,
    );

    const expenseCost = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const totalCost = fuelCost + maintenanceCost + expenseCost;
    const profit = revenue - totalCost;

    return {
      revenue,
      costs: {
        fuel: fuelCost,
        maintenance: maintenanceCost,
        expenses: expenseCost,
        total: totalCost,
      },
      profit,
      profitMargin:
        revenue > 0
          ? Number(((profit / revenue) * 100).toFixed(2))
          : 0,
      status: profit >= 0 ? 'Profitable' : 'Loss',
    };
  }

  async getFuelIntelligence() {
    const [fuelRecords, trips] = await Promise.all([
      this.fuelRepository.find(),
      this.tripRepository.find(),
    ]);

    const totalLiters = fuelRecords.reduce(
      (sum, fuel) => sum + Number(fuel.liters || 0),
      0,
    );

    const totalFuelCost = fuelRecords.reduce(
      (sum, fuel) => sum + Number(fuel.cost || 0),
      0,
    );

    const totalDistance = trips.reduce(
      (sum, trip) => sum + Number(trip.distance || 0),
      0,
    );

    const averageFuelPrice =
      totalLiters > 0 ? totalFuelCost / totalLiters : 0;

    const fuelEfficiency =
      totalLiters > 0 ? totalDistance / totalLiters : 0;

    return {
      totalLiters,
      totalFuelCost,
      averageFuelPrice: Number(averageFuelPrice.toFixed(2)),
      totalDistance,
      fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
      unit: 'distance per liter',

      status:
        fuelEfficiency >= 10
          ? 'Efficient'
          : fuelEfficiency >= 6
            ? 'Average'
            : 'Needs Improvement',
    };
  }

  async getMaintenanceIntelligence() {
    const [vehicles, maintenanceRecords] = await Promise.all([
      this.vehicleRepository.find(),
      this.maintenanceRepository.find(),
    ]);

    const totalMaintenanceCost = maintenanceRecords.reduce(
      (sum, maintenance) => sum + Number(maintenance.cost || 0),
      0,
    );

    const pendingMaintenance = maintenanceRecords.filter(
      (maintenance) =>
        maintenance.status === 'Pending' ||
        maintenance.status === 'Scheduled',
    );

    const completedMaintenance = maintenanceRecords.filter(
      (maintenance) => maintenance.status === 'Completed',
    );

    const vehicleMaintenanceCounts = new Map<string, number>();

    for (const record of maintenanceRecords) {
      const current =
        vehicleMaintenanceCounts.get(record.vehicleCode) || 0;

      vehicleMaintenanceCounts.set(
        record.vehicleCode,
        current + 1,
      );
    }

    const highMaintenanceVehicles = Array.from(
      vehicleMaintenanceCounts.entries(),
    )
      .filter(([, count]) => count >= 3)
      .map(([vehicleCode, count]) => ({
        vehicleCode,
        maintenanceCount: count,
      }));

    return {
      totalVehicles: vehicles.length,
      totalMaintenanceRecords: maintenanceRecords.length,
      totalMaintenanceCost,
      pendingMaintenance: pendingMaintenance.length,
      completedMaintenance: completedMaintenance.length,
      highMaintenanceVehicles,

      recommendation:
        highMaintenanceVehicles.length > 0
          ? 'Review vehicles with repeated maintenance events.'
          : 'Maintenance activity is within a normal range.',
    };
  }

  async getRecommendations() {
    const intelligence = await this.getIntelligence();
    const fuel = await this.getFuelIntelligence();
    const maintenance = await this.getMaintenanceIntelligence();

    const recommendations: string[] = [];

    if (intelligence.summary.profit < 0) {
      recommendations.push(
        'Review operating costs and identify loss-making operations.',
      );
    }

    if (fuel.status === 'Needs Improvement') {
      recommendations.push(
        'Investigate fuel efficiency and monitor high-consumption vehicles.',
      );
    }

    if (maintenance.highMaintenanceVehicles.length > 0) {
      recommendations.push(
        'Inspect vehicles with repeated maintenance events for replacement or major repair.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Fleet performance is stable. Continue monitoring operational KPIs.',
      );
    }

    return {
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  }

  async getAlerts() {
    const [vehicles, maintenanceRecords, trips] = await Promise.all([
      this.vehicleRepository.find(),
      this.maintenanceRepository.find(),
      this.tripRepository.find(),
    ]);

    const alerts: Array<{
      type: string;
      severity: string;
      message: string;
    }> = [];

    const unavailableVehicles = vehicles.filter(
      (vehicle) =>
        vehicle.status !== 'Available' &&
        vehicle.status !== 'Active',
    );

    for (const vehicle of unavailableVehicles) {
      alerts.push({
        type: 'Vehicle',
        severity: 'Medium',
        message: `${vehicle.vehicleCode} is currently ${vehicle.status}.`,
      });
    }

    const pendingMaintenance = maintenanceRecords.filter(
      (maintenance) =>
        maintenance.status === 'Pending' ||
        maintenance.status === 'Scheduled',
    );

    if (pendingMaintenance.length > 0) {
      alerts.push({
        type: 'Maintenance',
        severity: 'High',
        message: `${pendingMaintenance.length} maintenance item(s) require attention.`,
      });
    }

    const delayedTrips = trips.filter(
      (trip) =>
        trip.status === 'Delayed' ||
        trip.status === 'Cancelled',
    );

    if (delayedTrips.length > 0) {
      alerts.push({
        type: 'Trips',
        severity: 'Medium',
        message: `${delayedTrips.length} trip(s) are delayed or cancelled.`,
      });
    }

    return {
      totalAlerts: alerts.length,
      alerts,
    };
  }

  async getRouteIntelligence() {
    const trips = await this.tripRepository.find();

    const routeMap = new Map<
      string,
      {
        origin: string;
        destination: string;
        trips: number;
        distance: number;
        revenue: number;
      }
    >();

    for (const trip of trips) {
      const key = `${trip.origin} → ${trip.destination}`;

      const existing = routeMap.get(key);

      if (existing) {
        existing.trips += 1;
        existing.distance += Number(trip.distance || 0);
        existing.revenue += Number(trip.revenue || 0);
      } else {
        routeMap.set(key, {
          origin: trip.origin,
          destination: trip.destination,
          trips: 1,
          distance: Number(trip.distance || 0),
          revenue: Number(trip.revenue || 0),
        });
      }
    }

    const routes = Array.from(routeMap.values())
      .map((route) => ({
        ...route,
        averageRevenue:
          route.trips > 0
            ? Number((route.revenue / route.trips).toFixed(2))
            : 0,
        averageDistance:
          route.trips > 0
            ? Number((route.distance / route.trips).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRoutes: routes.length,
      routes,
      topRoute: routes[0] || null,
    };
  }

  async getDriverIntelligence() {
    const [drivers, trips] = await Promise.all([
      this.driverRepository.find(),
      this.tripRepository.find(),
    ]);

    const driverStats = drivers.map((driver) => {
      const driverTrips = trips.filter(
        (trip) => trip.driverCode === driver.driverCode,
      );

      const totalDistance = driverTrips.reduce(
        (sum, trip) => sum + Number(trip.distance || 0),
        0,
      );

      const totalRevenue = driverTrips.reduce(
        (sum, trip) => sum + Number(trip.revenue || 0),
        0,
      );

      const completedTrips = driverTrips.filter(
        (trip) => trip.status === 'Completed',
      ).length;

      return {
        driverCode: driver.driverCode,
        name: driver.name,
        status: driver.status,
        totalTrips: driverTrips.length,
        completedTrips,
        totalDistance,
        totalRevenue,
        completionRate:
          driverTrips.length > 0
            ? Number(
                ((completedTrips / driverTrips.length) * 100).toFixed(
                  2,
                ),
              )
            : 0,
      };
    });

    driverStats.sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );

    return {
      totalDrivers: drivers.length,
      drivers: driverStats,
      topDriver: driverStats[0] || null,
    };
  }
}
