'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Permission, Role, RoleDataScopes } from '@/types/auth.types';
import {
  DATA_SCOPE_LABELS,
  ROLES,
  ROLE_ACCESS_LEVEL,
  ROLE_DESCRIPTIONS,
  ROLE_DISPLAY_ORDER,
  ROLE_LABELS,
  SCOPED_RESOURCES,
} from '@/types/auth.types';
import { ACCESS_CONTROL_TEXT } from '../constants/access-control-text.constants';

interface RoleSummaryListProps {
  rolePermissions: Record<Role, Permission[]>;
  roleScopes: Record<Role, RoleDataScopes>;
}

/** Read-only overview of what each level ends up with under the current draft. */
export function RoleSummaryList({ rolePermissions, roleScopes }: RoleSummaryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ACCESS_CONTROL_TEXT.rolesTitle}</CardTitle>
        <CardDescription>{ACCESS_CONTROL_TEXT.rolesDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ROLE_DISPLAY_ORDER.map((role) => {
          const permissionCount =
            role === ROLES.SUPER_ADMIN
              ? rolePermissions[ROLES.SUPER_ADMIN].length
              : (rolePermissions[role] ?? []).length;

          return (
            <div key={role} className="rounded-md border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-orange text-white hover:bg-orange">
                  {ACCESS_CONTROL_TEXT.roleLevelLabel(ROLE_ACCESS_LEVEL[role])}
                </Badge>
                <span className="font-medium text-text-main">{ROLE_LABELS[role]}</span>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {ACCESS_CONTROL_TEXT.rolePermissionCount(permissionCount)}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-charcoal">{ROLE_DESCRIPTIONS[role]}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {DATA_SCOPE_LABELS[roleScopes[role][SCOPED_RESOURCES.STORE]]}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
