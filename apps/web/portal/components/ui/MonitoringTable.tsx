"use client";

import { useState, useMemo } from "react";
import { toTitleCase, exportToCsv } from "@/lib/utils";
import { Input } from "@/lib/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/ui/components/select";
import { Button } from "@/lib/ui/components/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isDeleted: boolean;
  mustChangePassword: boolean;
}

interface MonitoringTableProps {
  users: User[];
}

const ITEMS_PER_PAGE = 10;

export function MonitoringTable({ users }: MonitoringTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter users based on search, status, and role
  const filteredUsers = useMemo(() => {
    let result = users;

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.username.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((u) => !u.isDeleted);
    } else if (statusFilter === "deleted") {
      result = result.filter((u) => u.isDeleted);
    } else if (statusFilter === "pending") {
      result = result.filter((u) => !u.isDeleted && u.mustChangePassword);
    }

    // Role filter
    if (roleFilter === "super-admin") {
      result = result.filter((u) => u.role === "Super Admin");
    } else if (roleFilter === "ceo") {
      result = result.filter((u) => u.role === "CEO");
    } else if (roleFilter === "staff") {
      result = result.filter((u) => u.role === "Staff/Employee");
    }

    return result;
  }, [users, search, statusFilter, roleFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = [
      "Employee ID",
      "Full Name",
      "Email Address",
      "Role",
      "Status",
      "Policy",
    ];
    const rows = filteredUsers.map((user) => [
      user.username,
      `${toTitleCase(user.firstName)} ${toTitleCase(user.lastName)}`,
      user.email,
      user.role,
      user.isDeleted ? "Deleted" : "Active",
      user.mustChangePassword ? "Reset Pending" : "Configured",
    ]);
    const filename = `monitoring-export-${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCsv(filename, headers, rows);
  };

  return (
    <>
      {/* Filters & Controls */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-4 space-y-2">
          <label className="text-sm font-medium text-secondary uppercase tracking-wider">
            Search Users
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-surface-container-lowest border-border focus-visible:border-primary focus-visible:ring-primary/10"
            />
          </div>
        </div>

        <div className="md:col-span-3 space-y-2">
          <label className="text-sm font-medium text-secondary uppercase tracking-wider">
            Account Status
          </label>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full bg-surface-container-lowest border-border">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)] bg-surface-container-lowest border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deleted">Soft Deleted</SelectItem>
              <SelectItem value="pending">Password Reset Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3 space-y-2">
          <label className="text-sm font-medium text-secondary uppercase tracking-wider">
            Role Filter
          </label>
          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full bg-surface-container-lowest border-border">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)] bg-surface-container-lowest border-border">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super-admin">Super Admin</SelectItem>
              <SelectItem value="ceo">CEO</SelectItem>
              <SelectItem value="staff">Staff/Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button className="w-full md:w-auto gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </section>

      {/* Audit Table */}
      <div className="bg-surface-container-lowest border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="[&_tr]:border-border">
            <TableRow className="bg-surface-container-low border-b border-border hover:bg-surface-container-low">
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider">
                Employee ID
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider">
                Full Name
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider">
                Email Address
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider">
                Role
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider">
                Policy
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-border">
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-6 py-10 text-center text-secondary"
                >
                  No directory records found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className={
                    user.isDeleted
                      ? "bg-error-container/5 hover:bg-error-container/10"
                      : "hover:bg-surface-container-low"
                  }
                >
                  <TableCell className="px-6 py-4 font-mono text-sm font-medium text-on-surface">
                    {user.username}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-base font-medium text-on-surface">
                    {toTitleCase(user.firstName)} {toTitleCase(user.lastName)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-base text-secondary">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-base text-on-surface">
                    {user.role}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {user.isDeleted ? (
                      <StatusBadge variant="critical" label="Deleted" />
                    ) : (
                      <StatusBadge variant="success" label="Active" />
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {user.mustChangePassword ? (
                      <StatusBadge variant="warning" label="Reset Pending" />
                    ) : (
                      <span className="text-sm font-bold uppercase text-secondary tracking-widest">
                        Configured
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-border flex items-center justify-between">
          <span className="text-base text-secondary">
            Showing {paginatedUsers.length} of {filteredUsers.length} entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              className="h-10 px-4 gap-2 text-sm font-medium"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-on-surface px-3">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="default"
              className="h-10 px-4 gap-2 text-sm font-medium"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
