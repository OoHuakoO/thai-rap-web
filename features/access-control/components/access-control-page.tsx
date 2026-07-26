'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { Loading } from '@/components/shared/loading';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ACCESS_CONTROL_TEXT } from '../constants/access-control-text.constants';
import { useAccessControl } from '../hooks/use-access-control';
import { AccessControlEditor } from './access-control-editor';

export function AccessControlPage() {
  const { data: config, isLoading, isError, error } = useAccessControl();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text-main">{ACCESS_CONTROL_TEXT.pageTitle}</h1>
        <p className="text-sm text-charcoal">{ACCESS_CONTROL_TEXT.pageDescription}</p>
      </div>

      <AlertCard variant="info" message={ACCESS_CONTROL_TEXT.superAdminOnlyNote} />

      {isLoading && <Loading className="py-16" />}

      {isError && (
        <AlertCard
          variant="error"
          title={ACCESS_CONTROL_TEXT.loadError}
          message={extractErrorMessage(error)}
        />
      )}

      {/* Remounts on every save/reset so the draft restarts from the saved config. */}
      {config && <AccessControlEditor key={config.updatedAt} config={config} />}
    </section>
  );
}
