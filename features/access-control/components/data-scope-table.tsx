'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DataScope, Role, RoleDataScopes, ScopedResource } from '@/types/auth.types';
import {
  DATA_SCOPES,
  DATA_SCOPE_LABELS,
  ROLES,
  ROLE_DISPLAY_ORDER,
  ROLE_LABELS,
  SCOPED_RESOURCES,
  SCOPED_RESOURCE_LABELS,
} from '@/types/auth.types';
import { ACCESS_CONTROL_TEXT } from '../constants/access-control-text.constants';

interface DataScopeTableProps {
  value: Record<Role, RoleDataScopes>;
  onChange: (next: Record<Role, RoleDataScopes>) => void;
}

const SCOPE_OPTIONS = Object.values(DATA_SCOPES);
const RESOURCES = Object.values(SCOPED_RESOURCES);

export function DataScopeTable({ value, onChange }: DataScopeTableProps) {
  const setScope = (role: Role, resource: ScopedResource, scope: DataScope) => {
    onChange({ ...value, [role]: { ...value[role], [resource]: scope } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ACCESS_CONTROL_TEXT.scopeTitle}</CardTitle>
        <CardDescription>{ACCESS_CONTROL_TEXT.scopeDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto rounded-md border">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {ACCESS_CONTROL_TEXT.scopeRoleColumn}
                </th>
                {RESOURCES.map((resource) => (
                  <th
                    key={resource}
                    scope="col"
                    className="px-3 py-3 text-left font-medium text-muted-foreground"
                  >
                    {SCOPED_RESOURCE_LABELS[resource]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_DISPLAY_ORDER.map((role) => {
                // SUPER_ADMIN sees everything by definition — narrowing its scope
                // would lock the only account that can widen it again.
                const isLocked = role === ROLES.SUPER_ADMIN;

                return (
                  <tr key={role} className="border-b last:border-0">
                    <td className="px-4 py-2.5 text-charcoal">{ROLE_LABELS[role]}</td>
                    {RESOURCES.map((resource) => (
                      <td key={resource} className="px-3 py-2.5">
                        <Select
                          value={value[role][resource]}
                          disabled={isLocked}
                          onValueChange={(next) => setScope(role, resource, next as DataScope)}
                        >
                          <SelectTrigger
                            className="h-9 w-full min-w-[180px]"
                            aria-label={`${ROLE_LABELS[role]} — ${SCOPED_RESOURCE_LABELS[resource]}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SCOPE_OPTIONS.map((scope) => (
                              <SelectItem key={scope} value={scope}>
                                {DATA_SCOPE_LABELS[scope]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
