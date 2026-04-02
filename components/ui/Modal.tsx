import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  footer,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} my-8`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#141718]">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
