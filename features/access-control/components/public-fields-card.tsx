'use client';

import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCard } from '@/components/shared/alert-card';
import type { StoreFieldKey } from '@/types/auth.types';
import { SENSITIVE_STORE_FIELDS, STORE_FIELDS, STORE_FIELD_LABELS } from '@/types/auth.types';
import { ACCESS_CONTROL_TEXT } from '../constants/access-control-text.constants';

interface PublicFieldsCardProps {
  value: StoreFieldKey[];
  onChange: (next: StoreFieldKey[]) => void;
}

const ALL_FIELDS = Object.values(STORE_FIELDS);

export function PublicFieldsCard({ value, onChange }: PublicFieldsCardProps) {
  const toggleField = (field: StoreFieldKey, checked: boolean) => {
    onChange(checked ? [...value, field] : value.filter((f) => f !== field));
  };

  const disclosedSensitiveFields = value.filter((field) => SENSITIVE_STORE_FIELDS.includes(field));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ACCESS_CONTROL_TEXT.publicFieldsTitle}</CardTitle>
        <CardDescription>{ACCESS_CONTROL_TEXT.publicFieldsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {disclosedSensitiveFields.length > 0 && (
          <AlertCard
            variant="warning"
            title={ACCESS_CONTROL_TEXT.sensitiveWarning}
            message={disclosedSensitiveFields.map((field) => STORE_FIELD_LABELS[field]).join(', ')}
          />
        )}

        <p className="text-sm text-muted-foreground">
          {ACCESS_CONTROL_TEXT.publicFieldsSelected(value.length, ALL_FIELDS.length)}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_FIELDS.map((field) => {
            const isSensitive = SENSITIVE_STORE_FIELDS.includes(field);
            const inputId = `public-field-${field}`;

            return (
              <div key={field} className="flex items-center gap-2 rounded-md border p-3">
                <Checkbox
                  id={inputId}
                  checked={value.includes(field)}
                  onCheckedChange={(checked) => toggleField(field, checked === true)}
                />
                <Label htmlFor={inputId} className="flex-1 cursor-pointer text-sm font-normal">
                  {STORE_FIELD_LABELS[field]}
                </Label>
                {isSensitive && (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-[10px] text-amber-700"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {ACCESS_CONTROL_TEXT.sensitiveBadge}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
