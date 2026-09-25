import { UserListItemDto } from "@/lib/apiClient";
import { toTitleCase } from "@/lib/utils";
import Link from "next/link";
import { DeleteUserButton } from "@/components/ui/DeleteUserButton";
import { Button } from "@/lib/ui/components/button";
import { Badge } from "@/lib/ui/components/badge";
import { UserPlus, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/ui/components/table";

interface UsersPageContainerProps {
  users: UserListItemDto[];
  errorMsg?: string;
  onDeleteAction: (formData: FormData) => Promise<void>;
}

export function UsersPageContainer({ users, errorMsg, onDeleteAction }: UsersPageContainerProps) {
  return (
    <div className="space-y-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            User Management Console
          </h1>
          <p className="text-base text-secondary mt-1">
            Create new employee accounts, update system access roles, and manage permissions policies.
          </p>
        </div>
        <div>
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="size-4" />
              Add New User
            </Link>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-error-container p-4 text-sm text-on-error-container border border-error/20">
          {errorMsg}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-surface-container-lowest border border-border rounded-xl overflow-hidden">
        <Table className="lg:table-fixed">
          <TableHeader className="[&_tr]:border-border">
            <TableRow className="bg-surface-container-low border-b border-border hover:bg-surface-container-low">
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider lg:w-[15%]">
                Employee ID / Username
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider lg:w-[18%] lg:whitespace-normal">
                Full Name
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider lg:w-[22%] lg:whitespace-normal">
                Email Address
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider lg:w-[13%]">
                Assigned Role
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider lg:w-[15%]">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-sm font-medium text-secondary uppercase tracking-wider text-center lg:w-[17%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-border">
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-10 text-center text-secondary">
                  No active directory users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSuperAdmin = user.role.toLowerCase() === "super admin";

                return (
                  <TableRow key={user.id} className="hover:bg-surface-container-low">
                    <TableCell className="px-6 py-4 font-mono text-sm font-medium text-on-surface lg:whitespace-normal lg:break-all">
                      {user.username}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-base font-medium text-on-surface lg:whitespace-normal">
                      {toTitleCase(user.firstName)} {toTitleCase(user.lastName)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-base text-secondary lg:whitespace-normal lg:break-all">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-6 py-4 lg:whitespace-normal">
                      <Badge variant="secondary">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 lg:whitespace-normal">
                      {user.mustChangePassword ? (
                        <Badge className="bg-warning/10 text-warning border-warning/30">
                          Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-success/10 text-success border-success/30">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {!isSuperAdmin && (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/${user.id}`}>
                              <Pencil className="size-3.5" />
                              Edit
                            </Link>
                          </Button>
                          <DeleteUserButton userId={user.id} onDeleteAction={onDeleteAction} />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
