'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CONFIRM_DIALOG_TEXT } from '@/constants';

type DialogVariant = 'default' | 'destructive';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

interface AlertOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

interface DialogState {
  mode: 'confirm' | 'alert';
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: DialogVariant;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DialogState | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  const settle = useCallback((result: boolean) => {
    setOpen(false);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({
        mode: 'confirm',
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? CONFIRM_DIALOG_TEXT.confirm,
        cancelLabel: options.cancelLabel ?? CONFIRM_DIALOG_TEXT.cancel,
        variant: options.variant ?? 'default',
      });
      setOpen(true);
    });
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
      setState({
        mode: 'alert',
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? CONFIRM_DIALOG_TEXT.ok,
        cancelLabel: CONFIRM_DIALOG_TEXT.cancel,
        variant: 'default',
      });
      setOpen(true);
    });
  }, []);

  // Escape / overlay click / close button resolves as cancel (false).
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) settle(false);
    },
    [settle]
  );

  const value = useMemo(() => ({ confirm, alert }), [confirm, alert]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {state && (
          <DialogContent className="max-w-sm">
            <DialogHeader className="sm:text-center">
              <DialogTitle>{state.title}</DialogTitle>
              {state.description && (
                <DialogDescription className="whitespace-pre-line">
                  {state.description}
                </DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              {state.mode === 'confirm' && (
                <Button variant="outline" onClick={() => settle(false)}>
                  {state.cancelLabel}
                </Button>
              )}
              <Button variant={state.variant} onClick={() => settle(true)}>
                {state.confirmLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}

function useConfirmDialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
}

/** Returns a function that opens a centered confirm dialog and resolves to the user's choice. */
export function useConfirm() {
  return useConfirmDialog().confirm;
}

/** Returns a function that opens a centered informational dialog (single confirm button). */
export function useAlert() {
  return useConfirmDialog().alert;
}
