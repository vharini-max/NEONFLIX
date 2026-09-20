import React from 'react';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#1b1b20] border border-white/15 p-5 flex flex-col gap-4 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#00e479]">gavel</span>
            <h3 className="font-headline text-[18px] text-white font-bold">Legal Verification Audit</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1f1f24] border border-white/10 flex items-center justify-center text-[#e4e1e8] hover:bg-[#2a292e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5 font-body text-[13px] text-[#e9bcb6]">
          <div className="p-3 rounded-xl bg-[#1f1f24]/90 border border-white/5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#00e479] text-[19px] flex-shrink-0 mt-0.5">
              check_circle
            </span>
            <div>
              <strong className="text-white block font-mono-tech text-[12px]">Hollywood Public Domain</strong>
              <span>
                Verified pre-1929 and expired copyright works hosted via Archive.org and Wikimedia Commons public infrastructure.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#1f1f24]/90 border border-white/5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#00eefc] text-[19px] flex-shrink-0 mt-0.5">
              check_circle
            </span>
            <div>
              <strong className="text-white block font-mono-tech text-[12px]">KOFA Archival Channel</strong>
              <span>
                Direct partner catalog licensed by the Korean Film Archive for free global cultural dissemination and film preservation.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#1f1f24]/90 border border-white/5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#00e479] text-[19px] flex-shrink-0 mt-0.5">
              check_circle
            </span>
            <div>
              <strong className="text-white block font-mono-tech text-[12px]">Green Tea Official Broadcasts</strong>
              <span>
                Authorized studio YouTube embed feeds and verified streaming channel distributions with full digital rights management.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#1f1f24]/90 border border-white/5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[19px] flex-shrink-0 mt-0.5">
              animation
            </span>
            <div>
              <strong className="text-white block font-mono-tech text-[12px]">Cartoons & Classic Animation</strong>
              <span>
                Verified official animated features, studio trailers, and restored high fidelity visual masters.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#1f1f24]/90 border border-white/5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#e50914] text-[19px] flex-shrink-0 mt-0.5">
              movie
            </span>
            <div>
              <strong className="text-white block font-mono-tech text-[12px]">Copyrighted Blockbusters & Web Series</strong>
              <span>
                Zero piracy policy. We strictly present verified official 4K theatrical promotional trailers directly from official studio release networks.
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#e50914] text-white font-mono-tech text-[13px] font-bold shadow-[0_0_20px_rgba(229,9,20,0.5)] border border-red-400/40 active:scale-95 transition-all cursor-pointer"
        >
          DISMISS VERIFICATION
        </button>
      </div>
    </div>
  );
};
