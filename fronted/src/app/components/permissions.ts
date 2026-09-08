export type FleetFlowRole =
  | "Admin"
  | "Fleet Manager"
  | "Operations"
  | "Finance"
  | "Viewer";

export const permissions: Record<string, FleetFlowRole[]> = {
  dashboard: [
    "Admin",
    "Fleet Manager",
    "Operations",
    "Finance",
    "Viewer",
  ],

  vehicles: [
    "Admin",
    "Fleet Manager",
    "Operations",
  ],

  drivers: [
    "Admin",
    "Fleet Manager",
    "Operations",
  ],

  trips: [
    "Admin",
    "Fleet Manager",
    "Operations",
  ],

  fuel: [
    "Admin",
    "Fleet Manager",
    "Operations",
  ],

  maintenance: [
    "Admin",
    "Fleet Manager",
  ],

  expenses: [
    "Admin",
    "Finance",
  ],

  customers: [
    "Admin",
    "Operations",
  ],

  products: [
    "Admin",
    "Operations",
  ],

  suppliers: [
    "Admin",
    "Operations",
  ],

  warehouses: [
    "Admin",
    "Operations",
  ],

  inventory: [
    "Admin",
    "Operations",
  ],

  purchases: [
    "Admin",
    "Operations",
    "Finance",
  ],

  orders: [
    "Admin",
    "Operations",
    "Finance",
  ],

  payments: [
    "Admin",
    "Finance",
  ],

  reports: [
    "Admin",
    "Fleet Manager",
    "Operations",
    "Finance",
    "Viewer",
  ],

  analytics: [
    "Admin",
    "Fleet Manager",
    "Operations",
    "Finance",
    "Viewer",
  ],

  intelligence: [
    "Admin",
    "Fleet Manager",
    "Operations",
    "Finance",
    "Viewer",
  ],

  profitability: [
    "Admin",
    "Fleet Manager",
    "Finance",
  ],

  fuelIntelligence: [
    "Admin",
    "Fleet Manager",
    "Operations",
  ],

  maintenanceIntelligence: [
    "Admin",
    "Fleet Manager",
  ],

  recommendations: [
    "Admin",
    "Fleet Manager",
    "Operations",
    "Finance",
    "Viewer",
  ],

  alerts: [
    "Admin",
    "Fleet Manager",
    "Operations",
    "Finance",
    "Viewer",
  ],

  routeIntelligence: [
    "Admin",
    "Fleet Manager",
    "Operations",
  ],

  driverIntelligence: [
    "Admin",
    "Fleet Manager",
    "Operations",
  ],

  users: [
    "Admin",
  ],
};

export function hasPermission(
  permission: keyof typeof permissions,
  role: FleetFlowRole,
): boolean {
  return permissions[permission].includes(role);
}
