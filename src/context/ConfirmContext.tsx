import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface ConfirmContextType {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolveFn, setResolveFn] = useState<(value: boolean) => void>(() => () => {});

  const confirm = useCallback((message: string, options: ConfirmOptions = {}) => {
    setMessage(message);
    setOptions(options);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolveFn(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveFn(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveFn(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-[var(--primary-hex)]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-[var(--primary-hex)]/[0.08] w-full max-w-sm overflow-hidden scale-in-center">
            <div className="p-6">
              <div className="flex gap-4 items-start">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${options.destructive ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-[var(--accent-hex)]/10 text-[var(--accent-hex)]'}`}>
                  {options.destructive ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-serif font-bold text-[var(--primary-hex)] tracking-tight">
                    {options.title || 'Please Confirm'}
                  </h3>
                  <p className="text-sm text-[var(--primary-hex)]/60 mt-2 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#F8F8FB]/50 px-6 py-5 flex justify-end gap-3 border-t border-[var(--primary-hex)]/[0.05]">
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 text-sm font-semibold text-[var(--primary-hex)]/60 hover:text-[var(--primary-hex)] transition-colors"
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
                  options.destructive 
                    ? 'bg-[#F43F5E] hover:bg-[#d92c45] shadow-[#F43F5E]/20' 
                    : 'bg-[var(--primary-hex)] hover:bg-[#2a3545] shadow-[var(--primary-hex)]/20'
                }`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
