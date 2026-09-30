import React, { useState } from 'react';
import { X, User, RotateCcw, Check, Sparkles } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSaveName: (name: string) => void;
  onResetAll: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  currentName,
  onClose,
  onSaveName,
  onResetAll
}) => {
  const [nameInput, setNameInput] = useState<string>(currentName);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSaveName(nameInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-[#2a2a30] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#26262b] flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#f4f4f6]">
            <User className="w-4 h-4 text-orange-400" />
            <span>Hồ sơ & Cài đặt trang</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#6d6d76] hover:text-[#f4f4f6] p-1 rounded-lg hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-[#a1a1aa] mb-1.5">
                TÊN HỌC VIÊN CỦA BẠN:
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Nhập tên của bạn (VD: Bá Đại, Minh Khoa, v.v.)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111113] border border-[#2a2a30] text-sm text-white focus:outline-none focus:border-orange-500 transition"
                autoFocus
              />
              <p className="text-[11px] text-[#71717a] mt-1.5">
                Tên này sẽ được hiển thị khi chào mừng và trên bảng xếp hạng năng lực cá nhân.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#9d9da6] hover:text-white hover:bg-[#202024] transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-orange-600/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>

          {/* Reset All Progress Section */}
          <div className="pt-4 border-t border-[#26262b]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-400 font-mono flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  LÀM MỚI / ĐẶT LẠI TOÀN BỘ TRANG
                </h4>
                <p className="text-[11px] text-[#71717a] mt-1 leading-relaxed">
                  Xóa toàn bộ dữ liệu mẫu cũ, đưa XP về 0, Level 1 và bắt đầu một tiến trình học hoàn toàn mới của riêng bạn.
                </p>
              </div>
            </div>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="mt-3 w-full py-2 px-3 rounded-xl border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa dữ liệu cũ & Đặt lại từ đầu</span>
              </button>
            ) : (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                <p className="text-xs text-rose-200">
                  ⚠️ Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ, xóa hết dữ liệu và bắt đầu lại từ đầu?
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#202024] text-xs text-[#a1a1aa] hover:text-white"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetAll();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/30"
                  >
                    Xác nhận đặt lại
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
