import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                variant === 'danger' ? 'bg-red-100' :
                variant === 'warning' ? 'bg-orange-100' :
                'bg-cyan-100'
              }`}>
                <AlertTriangle className={`w-8 h-8 ${
                  variant === 'danger' ? 'text-red-600' :
                  variant === 'warning' ? 'text-orange-600' :
                  'text-cyan-600'
                }`} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-center mb-2">{title}</h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">{message}</p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-all text-white ${
                  variant === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 active:scale-95' 
                    : variant === 'warning'
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-cyan-500 hover:bg-cyan-600'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
