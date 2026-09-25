import {
  Users,
  ShoppingBag,
  Store,
  Contact,
  Package,
} from "lucide-react";

export const systems = [
  {
    title: "CRM",
    description: "Manage customer relationships, sales pipelines, and outreach campaigns.",
    icon: Users,
    color: "bg-surface-container-low",
  },
  {
    title: "HR Management",
    description: "Access payroll, leave requests, employee records, and performance reviews.",
    icon: Contact,
    color: "bg-surface-container",
  },
  {
    title: "Point of Sale",
    description: "Process transactions, manage registers, and handle retail operations.",
    icon: Store,
    color: "bg-surface-container-low",
  },
  {
    title: "Supply Chain",
    description: "Track inventory, manage suppliers, monitor shipments, and logistics.",
    icon: Package,
    color: "bg-surface-container",
  },
  {
    title: "Online Shop",
    description: "Manage product listings, process online orders, and update catalogs.",
    icon: ShoppingBag,
    color: "bg-surface-container-low",
  },
];
