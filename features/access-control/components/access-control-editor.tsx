'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { useAuthStore } from '@/stores/auth-store';
import type { AccessControlConfig, UpdateAccessControlDto } from '@/types/auth.types';
import { PERMISSIONS } from '@/types/auth.types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDateTime } from '@/utils/format-thai-date';
import { ACCESS_CONTROL_TEXT } from '../constants/access-control-text.constants';
import { useResetAccessControl, useUpdateAccessControl } from '../hooks/use-access-control';
import { DataScopeTable } from './data-scope-table';
import { PermissionMatrix } from './permission-matrix';
import { PublicFieldsCard } from './public-fields-card';
import { RoleSummaryList } from './role-summary-list';

interface AccessControlEditorProps {
  config: AccessControlConfig;
}

function toDraft(config: AccessControlConfig): UpdateAccessControlDto {
  return {
    rolePermissions: config.rolePermissions,
    roleScopes: config.roleScopes,
    publicStoreFields: config.publicStoreFields,
  };
}

/**
 * Mounted with `key={config.updatedAt}` by the page, so a saved/reset config
 * remounts this with a fresh draft instead of needing an effect to re-sync.
 */
export function AccessControlEditor({ config }: AccessControlEditorProps) {
  const [draft, setDraft] = useState<UpdateAccessControlDto>(() => toDraft(config));
  const confirm = useConfirm();
  const can = useAuthStore((s) => s.can);
  const canManage = can(PERMISSIONS.PERMISSIONS_MANAGE);

  const { mutate: save, isPending: isSaving } = useUpdateAccessControl();
  const { mutate: resetToDefaults, isPending: isResetting } = useResetAccessControl();

  const isDirty = JSON.stringify(draft) !== JSON.stringify(toDraft(config));

  const handleSave = () => {
    save(draft, {
      onSuccess: () => toast.success(ACCESS_CONTROL_TEXT.saveSuccess),
      onError: (error) => toast.error(extractErrorMessage(error)),
    });
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: ACCESS_CONTROL_TEXT.resetConfirmTitle,
      description: ACCESS_CONTROL_TEXT.resetConfirmDescription,
      confirmLabel: ACCESS_CONTROL_TEXT.resetConfirmLabel,
      variant: 'destructive',
    });
    if (!confirmed) return;

    resetToDefaults(undefined, {
      onSuccess: () => toast.success(ACCESS_CONTROL_TEXT.saveSuccess),
      onError: (error) => toast.error(extractErrorMessage(error)),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {ACCESS_CONTROL_TEXT.lastUpdated(formatThaiDateTime(config.updatedAt), config.updatedBy)}
        </p>

        {canManage && (
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-xs text-orange">{ACCESS_CONTROL_TEXT.unsavedChanges}</span>
            )}
            <Button
              variant="outline"
              onClick={() => setDraft(toDraft(config))}
              disabled={!isDirty || isSaving || isResetting}
            >
              {ACCESS_CONTROL_TEXT.discard}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isSaving || isResetting}>
              {ACCESS_CONTROL_TEXT.reset}
            </Button>
            <Button onClick={handleSave} disabled={!isDirty || isSaving || isResetting}>
              {isSaving ? ACCESS_CONTROL_TEXT.saving : ACCESS_CONTROL_TEXT.save}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">{ACCESS_CONTROL_TEXT.tabPermissions}</TabsTrigger>
          <TabsTrigger value="scopes">{ACCESS_CONTROL_TEXT.tabScopes}</TabsTrigger>
          <TabsTrigger value="public-fields">{ACCESS_CONTROL_TEXT.tabPublicFields}</TabsTrigger>
          <TabsTrigger value="roles">{ACCESS_CONTROL_TEXT.tabRoles}</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="mt-4">
          <PermissionMatrix
            value={draft.rolePermissions}
            onChange={(rolePermissions) => setDraft({ ...draft, rolePermissions })}
          />
        </TabsContent>

        <TabsContent value="scopes" className="mt-4">
          <DataScopeTable
            value={draft.roleScopes}
            onChange={(roleScopes) => setDraft({ ...draft, roleScopes })}
          />
        </TabsContent>

        <TabsContent value="public-fields" className="mt-4">
          <PublicFieldsCard
            value={draft.publicStoreFields}
            onChange={(publicStoreFields) => setDraft({ ...draft, publicStoreFields })}
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <RoleSummaryList
            rolePermissions={draft.rolePermissions}
            roleScopes={draft.roleScopes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
