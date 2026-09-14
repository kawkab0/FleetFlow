import { Injectable } from "@nestjs/common";
import {
  InjectRepository,
} from "@nestjs/typeorm";
import {
  DataSource,
  IsNull,
  Repository,
} from "typeorm";

import { Notification } from "./notification.entity";

type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "danger";

type NotificationPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

type GeneratedNotification = {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  link: string;
  sourceKey: string;
};

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly dataSource: DataSource,
  ) {}

  async create(data: {
    title: string;
    message: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    link?: string;
    userId?: number;
    sourceKey?: string;
  }) {
    if (data.sourceKey) {
      const existing =
        await this.notificationRepository.findOne({
          where: {
            sourceKey: data.sourceKey,
          },
        });

      if (existing) {
        return existing;
      }
    }

    const notification =
      this.notificationRepository.create({
        title: data.title,
        message: data.message,
        type: data.type ?? "info",
        priority:
          data.priority ?? "medium",
        link: data.link ?? null,
        userId: data.userId ?? null,
        sourceKey: data.sourceKey ?? null,
        isRead: false,
      });

    return this.notificationRepository.save(
      notification,
    );
  }

  private async tableExists(
    tableName: string,
  ): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          ) AS exists
        `,
        [tableName],
      );

      return result[0]?.exists === true;
    } catch {
      return false;
    }
  }

  async generateSystemNotifications() {
    const generated: GeneratedNotification[] = [];

    /*
     * 1. LOW INVENTORY
     */
    try {
      if (
        await this.tableExists("inventory")
      ) {
        const rows =
          await this.dataSource.query(`
            SELECT
              id,
              "productId",
              quantity,
              "reorderLevel"
            FROM inventory
            WHERE
              "isActive" = true
              AND quantity <= "reorderLevel"
            ORDER BY quantity ASC
            LIMIT 20
          `);

        for (const row of rows) {
          const critical =
            Number(row.quantity) <= 0;

          generated.push({
            title: critical
              ? "Critical Inventory Alert"
              : "Low Inventory",
            message:
              `Product #${row.productId} has ${row.quantity} units remaining, which is at or below the reorder level of ${row.reorderLevel}.`,
            type: critical
              ? "danger"
              : "warning",
            priority: critical
              ? "critical"
              : "high",
            link: "/inventory",
            sourceKey:
              `inventory-low-${row.id}-${row.quantity}-${row.reorderLevel}`,
          });
        }
      }
    } catch {
      // Ignore inventory notification errors.
    }

    /*
     * 2. MAINTENANCE ATTENTION
     */
    try {
      if (
        await this.tableExists("maintenance")
      ) {
        const rows =
          await this.dataSource.query(`
            SELECT
              id,
              "maintenanceCode",
              "vehicleCode",
              "maintenanceDate",
              "maintenanceType",
              status
            FROM maintenance
            WHERE
              LOWER(
                COALESCE(status, '')
              ) NOT IN (
                'completed',
                'cancelled',
                'closed'
              )
            ORDER BY "maintenanceDate" ASC
            LIMIT 20
          `);

        for (const row of rows) {
          generated.push({
            title:
              "Maintenance Attention Required",
            message:
              `Vehicle ${row.vehicleCode} has ${row.maintenanceType || "maintenance"} with status "${row.status || "Pending"}".`,
            type: "warning",
            priority: "high",
            link: "/maintenance",
            sourceKey:
              `maintenance-${row.id}-${row.status}`,
          });
        }
      }
    } catch {
      // Ignore maintenance notification errors.
    }

    /*
     * 3. OVERDUE / DELAYED TRIPS
     */
    try {
      if (
        await this.tableExists("trips")
      ) {
        const rows =
          await this.dataSource.query(`
            SELECT
              id,
              "tripCode",
              origin,
              destination,
              "vehicleCode",
              "driverCode",
              "tripDate",
              status
            FROM trips
            WHERE
              LOWER(
                COALESCE(status, '')
              ) IN (
                'pending',
                'scheduled',
                'overdue',
                'delayed'
              )
            ORDER BY "tripDate" ASC
            LIMIT 20
          `);

        for (const row of rows) {
          const status =
            row.status?.toLowerCase();

          const tripName =
            row.tripCode ||
            `Trip #${row.id}`;

          const isCritical =
            status === "overdue";

          generated.push({
            title: isCritical
              ? "Overdue Trip Alert"
              : "Trip Requires Attention",
            message:
              `${tripName} from ${row.origin} to ${row.destination} is currently "${row.status}".`,
            type: isCritical
              ? "danger"
              : "info",
            priority: isCritical
              ? "critical"
              : "medium",
            link: "/trips",
            sourceKey:
              `trip-${row.id}-${row.status}`,
          });
        }
      }
    } catch {
      // Ignore trip notification errors.
    }

    /*
     * 4. VEHICLE STATUS ALERTS
     */
    try {
      if (
        await this.tableExists("vehicles")
      ) {
        const rows =
          await this.dataSource.query(`
            SELECT
              id,
              "vehicleCode",
              "registrationNumber",
              model,
              status
            FROM vehicles
            WHERE
              LOWER(
                COALESCE(status, '')
              ) IN (
                'maintenance',
                'inactive',
                'out of service',
                'out_of_service'
              )
            LIMIT 20
          `);

        for (const row of rows) {
          const vehicleName =
            row.vehicleCode ||
            row.registrationNumber ||
            `Vehicle #${row.id}`;

          generated.push({
            title:
              "Vehicle Status Alert",
            message:
              `${vehicleName} is currently marked as "${row.status}".`,
            type: "danger",
            priority: "high",
            link: "/vehicles",
            sourceKey:
              `vehicle-status-${row.id}-${row.status}`,
          });
        }
      }
    } catch {
      // Ignore vehicle notification errors.
    }

    /*
     * 5. PENDING PURCHASES
     */
    try {
      if (
        await this.tableExists("purchases")
      ) {
        const rows =
          await this.dataSource.query(`
            SELECT
              id,
              "supplierId",
              "purchaseDate",
              "totalAmount",
              status,
              "referenceNumber"
            FROM purchases
            WHERE
              LOWER(
                COALESCE(status, '')
              ) IN (
                'pending',
                'draft',
                'processing'
              )
            ORDER BY "purchaseDate" ASC
            LIMIT 20
          `);

        for (const row of rows) {
          const reference =
            row.referenceNumber ||
            `Purchase #${row.id}`;

          generated.push({
            title:
              "Purchase Requires Attention",
            message:
              `${reference} is currently "${row.status}" with a total amount of ${row.totalAmount}.`,
            type: "info",
            priority: "medium",
            link: "/purchases",
            sourceKey:
              `purchase-${row.id}-${row.status}`,
          });
        }
      }
    } catch {
      // Ignore purchase notification errors.
    }

    /*
     * 6. PAYMENT ALERTS
     */
    try {
      if (
        await this.tableExists("payments")
      ) {
        const rows =
          await this.dataSource.query(`
            SELECT
              id,
              "salesOrderId",
              amount,
              "paymentDate",
              status,
              "referenceNumber"
            FROM payments
            WHERE
              LOWER(
                COALESCE(status, '')
              ) IN (
                'pending',
                'processing',
                'failed',
                'overdue'
              )
            ORDER BY "paymentDate" ASC
            LIMIT 20
          `);

        for (const row of rows) {
          const reference =
            row.referenceNumber ||
            `Payment #${row.id}`;

          const status =
            row.status?.toLowerCase();

          const critical =
            [
              "failed",
              "overdue",
            ].includes(status);

          generated.push({
            title: critical
              ? "Critical Payment Alert"
              : "Payment Requires Attention",
            message:
              `${reference} for Sales Order #${row.salesOrderId} is currently "${row.status}" with an amount of ${row.amount}.`,
            type: critical
              ? "danger"
              : "warning",
            priority: critical
              ? "critical"
              : "high",
            link: "/payments",
            sourceKey:
              `payment-${row.id}-${row.status}`,
          });
        }
      }
    } catch {
      // Ignore payment notification errors.
    }

    /*
     * SAVE GENERATED NOTIFICATIONS
     */
    for (const notification of generated) {
      try {
        await this.create(notification);
      } catch {
        // Ignore duplicate/save errors.
      }
    }

    return {
      success: true,
      generated: generated.length,
    };
  }

  async findAll(userId?: number) {
    await this.generateSystemNotifications();

    const notifications =
      userId
        ? await this.notificationRepository.find({
            where: [
              {
                userId,
              },
              {
                userId: IsNull(),
              },
            ],
            order: {
              createdAt: "DESC",
            },
          })
        : await this.notificationRepository.find({
            order: {
              createdAt: "DESC",
            },
          });

    return notifications.sort(
      (a, b) =>
        this.priorityWeight(b.priority) -
          this.priorityWeight(a.priority) ||
        new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
    );
  }

  async findUnread(userId?: number) {
    await this.generateSystemNotifications();

    const notifications =
      userId
        ? await this.notificationRepository.find({
            where: [
              {
                userId,
                isRead: false,
              },
              {
                userId: IsNull(),
                isRead: false,
              },
            ],
            order: {
              createdAt: "DESC",
            },
          })
        : await this.notificationRepository.find({
            where: {
              isRead: false,
            },
            order: {
              createdAt: "DESC",
            },
          });

    return notifications.sort(
      (a, b) =>
        this.priorityWeight(b.priority) -
          this.priorityWeight(a.priority) ||
        new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
    );
  }

  async getUnreadCount(userId?: number) {
    await this.generateSystemNotifications();

    if (userId) {
      return this.notificationRepository.count({
        where: [
          {
            userId,
            isRead: false,
          },
          {
            userId: IsNull(),
            isRead: false,
          },
        ],
      });
    }

    return this.notificationRepository.count({
      where: {
        isRead: false,
      },
    });
  }

  async markAsRead(id: number) {
    await this.notificationRepository.update(
      id,
      {
        isRead: true,
      },
    );

    return this.notificationRepository.findOne({
      where: {
        id,
      },
    });
  }

  async markAllAsRead(userId?: number) {
    if (userId) {
      await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({
          isRead: true,
        })
        .where(
          "(userId = :userId OR userId IS NULL)",
          {
            userId,
          },
        )
        .andWhere(
          "isRead = :isRead",
          {
            isRead: false,
          },
        )
        .execute();
    } else {
      await this.notificationRepository.update(
        {
          isRead: false,
        },
        {
          isRead: true,
        },
      );
    }

    return {
      success: true,
    };
  }

  private priorityWeight(
    priority: string,
  ) {
    switch (
      priority?.toLowerCase()
    ) {
      case "critical":
        return 4;

      case "high":
        return 3;

      case "medium":
        return 2;

      case "low":
        return 1;

      default:
        return 2;
    }
  }
}
