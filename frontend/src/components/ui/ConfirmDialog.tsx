import { useState, type ReactNode } from "react";
import Button from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={onCancel} aria-label="Close" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/30 bg-white/95 p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    resolve?: (value: boolean) => void;
  }>({ open: false, title: "", message: "" });

  const confirm = (title: string, message: string) =>
    new Promise<boolean>((resolve) => {
      setState({ open: true, title, message, resolve });
    });

  const dialog: ReactNode = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      onCancel={() => {
        state.resolve?.(false);
        setState((s) => ({ ...s, open: false }));
      }}
      onConfirm={() => {
        state.resolve?.(true);
        setState((s) => ({ ...s, open: false }));
      }}
    />
  );

  return { confirm, dialog };
}

export default ConfirmDialog;
