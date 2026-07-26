'use client';

import { Fragment } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Permission, Role } from '@/types/auth.types';
import {
  ROLES,
  ROLE_DISPLAY_ORDER,
  ROLE_SHORT_LABELS,
  SUPER_ADMIN_ONLY_PERMISSIONS,
} from '@/types/auth.types';
import { ACCESS_CONTROL_TEXT } from '../constants/access-control-text.constants';
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
} from '../constants/permission-group.constants';

interface PermissionMatrixProps {
  value: Record<Role, Permission[]>;
  onChange: (next: Record<Role, Permission[]>) => void;
}

/**
 * A cell is locked when toggling it would produce an invalid config:
 * SUPER_ADMIN always holds everything, and permissions:manage belongs to
 * SUPER_ADMIN alone (constants/permissions.ts enforces the same rule at read
 * time, so a tampered payload changes nothing).
 */
function getLockedHint(role: Role, permission: Permission): string | null {
  if (role === ROLES.SUPER_ADMIN) return ACCESS_CONTROL_TEXT.superAdminLockedHint;
  if (SUPER_ADMIN_ONLY_PERMISSIONS.includes(permission)) return ACCESS_CONTROL_TEXT.lockedHint;
  return null;
}

export function PermissionMatrix({ value, onChange }: PermissionMatrixProps) {
  const togglePermission = (role: Role, permission: Permission, checked: boolean) => {
    const current = value[role] ?? [];
    const next = checked
      ? [...current, permission]
      : current.filter((p) => p !== permission);
    onChange({ ...value, [role]: next });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full overflow-x-auto rounded-md border">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium text-muted-foreground">
                {ACCESS_CONTROL_TEXT.permissionColumn}
              </th>
              {ROLE_DISPLAY_ORDER.map((role) => (
                <th
                  key={role}
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-muted-foreground"
                >
                  {ROLE_SHORT_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group) => (
              <Fragment key={group.key}>
                <tr className="border-b bg-cream-light/60">
                  <td
                    colSpan={ROLE_DISPLAY_ORDER.length + 1}
                    className="sticky left-0 px-4 py-2 text-xs font-semibold text-text-main"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.permissions.map((permission) => (
                  <tr key={permission} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 text-charcoal">
                      {PERMISSION_LABELS[permission]}
                    </td>
                    {ROLE_DISPLAY_ORDER.map((role) => {
                      const lockedHint = getLockedHint(role, permission);
                      const isChecked =
                        role === ROLES.SUPER_ADMIN || (value[role] ?? []).includes(permission);
                      const checkbox = (
                        <Checkbox
                          checked={isChecked}
                          disabled={lockedHint !== null}
                          aria-label={`${ROLE_SHORT_LABELS[role]} — ${PERMISSION_LABELS[permission]}`}
                          onCheckedChange={(checked) =>
                            togglePermission(role, permission, checked === true)
                          }
                        />
                      );

                      return (
                        <td key={role} className="px-2 py-2.5 text-center">
                          <div className="flex justify-center">
                            {lockedHint ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">{checkbox}</span>
                                </TooltipTrigger>
                                <TooltipContent>{lockedHint}</TooltipContent>
                              </Tooltip>
                            ) : (
                              checkbox
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
