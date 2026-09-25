import { UserListItemDto } from "@/lib/apiClient";
import { Card, CardContent } from "@/lib/ui/components/card";
import { MonitoringTable } from "@/components/ui/MonitoringTable";
import { Shield } from "lucide-react";

interface MonitoringPageContainerProps {
  users: UserListItemDto[];
  errorMsg?: string;
}

export function MonitoringPageContainer({ users, errorMsg }: MonitoringPageContainerProps) {
  // Calculate statistics
  const totalUsers = users.length;
  const deletedUsers = users.filter((u) => u.isDeleted).length;
  const activeUsers = totalUsers - deletedUsers;
  const pendingPasswordReset = users.filter(
    (u) => !u.isDeleted && u.mustChangePassword
  ).length;

  const adminCount = users.filter(
    (u) => !u.isDeleted && (u.role === "Super Admin" || u.role === "CEO")
  ).length;

  return (
    <div className="space-y-8 py-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Admin: System Monitoring
        </h1>
        <p className="text-base text-secondary mt-1">
          User directory telemetry and account status overview.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-error-container p-4 text-sm text-on-error-container border border-error/20">
          {errorMsg}
        </div>
      )}

      {/* Interactive Table with Filters */}
      <MonitoringTable users={users} />

      {/* Dashboard Metrics (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="bg-surface-container-lowest border-border">
          <CardContent className="p-6 flex flex-col justify-between">
            <span className="text-sm font-medium text-secondary uppercase tracking-widest mb-4">
              Total Directory Users
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-on-surface">
                {totalUsers}
              </span>
              <span className="text-sm font-medium text-green-600">
                {activeUsers} active
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card className="bg-surface-container-lowest border-border">
          <CardContent className="p-6 flex flex-col justify-between">
            <span className="text-sm font-medium text-secondary uppercase tracking-widest mb-4">
              Security Alerts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-error">
                {pendingPasswordReset}
              </span>
              <span className="text-sm font-medium text-error">
                Pending Resets
              </span>
            </div>
          </CardContent>
        </Card>

        {/* System Integrity Card (dark) */}
        <Card className="md:col-span-2 bg-primary-container border-border relative overflow-hidden">
          <CardContent className="p-6 flex flex-col justify-center relative z-10">
            <h4 className="text-on-primary font-semibold text-xl mb-1">
              System Integrity
            </h4>
            <p className="text-on-primary-container text-base">
              Real-time directory monitoring is active. {adminCount} admin
              {adminCount !== 1 ? "s" : ""} and {activeUsers - adminCount} staff
              account{activeUsers - adminCount !== 1 ? "s" : ""} are
              synchronized.
            </p>
          </CardContent>
          <div className="absolute right-0 top-0 w-32 h-full opacity-10 flex items-center justify-center pointer-events-none">
            <Shield className="w-24 h-24 text-white" />
          </div>
        </Card>
      </div>
    </div>
  );
}
