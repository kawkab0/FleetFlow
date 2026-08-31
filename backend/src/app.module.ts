import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { ProductsModule } from "./products/products.module";
import { SuppliersModule } from "./suppliers/suppliers.module";
import { WarehousesModule } from "./warehouses/warehouses.module";
import { InventoryModule } from "./inventory/inventory.module";
import { CustomersModule } from "./customers/customers.module";
import { SalesOrdersModule } from "./sales-orders/sales-orders.module";
import { SalesOrderDetailsModule } from "./sales-order-details/sales-order-details.module";
import { PurchasesModule } from "./purchases/purchases.module";
import { PurchaseDetailsModule } from "./purchase-details/purchase-details.module";
import { PaymentsModule } from "./payments/payments.module";
import { VehiclesModule } from "./vehicles/vehicles.module";
import { DriversModule } from "./drivers/drivers.module";
import { TripsModule } from "./trips/trips.module";
import { FuelModule } from './fuel/fuel.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DATABASE_HOST"),
        port: configService.get<number>("DATABASE_PORT"),
        username: configService.get<string>("DATABASE_USER"),
        password: configService.get<string>("DATABASE_PASSWORD"),
        database: configService.get<string>("DATABASE_NAME"),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    ProductsModule,
    SuppliersModule,
    WarehousesModule,
    InventoryModule,
    CustomersModule,
    SalesOrdersModule,
    SalesOrderDetailsModule,
    PurchasesModule,
    PurchaseDetailsModule,
    PaymentsModule,
    VehiclesModule,
    DriversModule,
    TripsModule,
    FuelModule,
    MaintenanceModule,
    ExpensesModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
