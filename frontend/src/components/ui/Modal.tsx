import type { ReactNode } from "react";
import Button from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

function Modal({ open, title, children, onClose, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Close dialog"
      />
<div className="relative w-full max-w-3xl rounded-2xl border border-white/30 bg-white/90 p-6 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <Button variant="ghost" className="!px-2 !py-1" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
