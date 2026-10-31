import React, { useState, useRef, useEffect } from 'react';
import { Vendor, VendorStatus } from '../../types/vendor';
import { MoreHorizontal, ArrowRight, Trash2, FileCheck } from 'lucide-react';

interface VendorCardActionMenuProps {
  vendor: Vendor;
  nextStatus: VendorStatus | null;
  onUpdateVendor: (id: string, partial: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
  onOpenNegotiation: (vendor: Vendor) => void;
}

export const VendorCardActionMenu: React.FC<VendorCardActionMenuProps> = ({
  vendor,
  nextStatus,
  onUpdateVendor,
  onDeleteVendor,
  onOpenNegotiation,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
    return undefined;
  }, [isMenuOpen]);

  const handleAdvance = () => {
    if (!nextStatus) return;
    const newContracted =
      nextStatus === 'contract_signed' && vendor.contractedPrice === 0
        ? vendor.estimatedPrice
        : vendor.contractedPrice;
    onUpdateVendor(vendor.id, {
      status: nextStatus,
      contractedPrice: newContracted,
    });
    setIsMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-1 rounded text-stone-500 hover:text-stone-700 dark:hover:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
        aria-label={`Actions for ${vendor.name}`}
        title="Vendor actions"
      >
        <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#18181B] border border-stone-200/90 dark:border-white/[0.1] rounded-lg shadow-lg py-1 z-30 animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              onOpenNegotiation(vendor);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-stone-700 dark:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#6E79F5]" />
            <span>Vet & negotiate</span>
          </button>

          {nextStatus && (
            <button
              type="button"
              onClick={handleAdvance}
              className="w-full text-left px-3 py-1.5 text-xs text-stone-700 dark:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Advance stage</span>
            </button>
          )}

          {onDeleteVendor && (
            <div className="border-t border-stone-100 dark:border-white/[0.06] mt-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeleteVendor(vendor.id);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete vendor</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

