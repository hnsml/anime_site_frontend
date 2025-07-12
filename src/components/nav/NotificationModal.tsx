import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { createPortal } from "react-dom";
import axios from "axios";
import { API_BASE_URL } from "@/config";

interface Notification {
  id: string;
  data: {
    message: string;
    url: string;
  };
  created_at: string;
  read_at: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const NotificationModal: React.FC<Props> = ({ open, onClose, anchorRef }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Завантаження сповіщень при відкритті модалки
  useEffect(() => {
    if (!open) return;

    async function fetchNotifications() {
      try {
        const res = await axios.get<Notification[]>(`${API_BASE_URL}notifications`, {
          withCredentials: true, // щоб передавати куки сесії
        });
        setNotifications(res.data);
      } catch (e) {
        console.error("Не вдалося отримати сповіщення", e);
      }
    }

    fetchNotifications();
  }, [open]);

  // Обчислення позиції модалки відносно кнопки
  useEffect(() => {
    function updatePos() {
      if (open && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 10, left: rect.right - 380 });
      }
    }
    updatePos();
    window.addEventListener("scroll", updatePos);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, anchorRef]);

  // Закриття при кліку поза модалкою
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, anchorRef]);

  // Позначити всі сповіщення як прочитані
  const markAllRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}notifications/mark_read`, null, {
        withCredentials: true,
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (e) {
      console.error("Не вдалося позначити як прочитані", e);
    }
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 1000,
            width: 380,
          }}
          className="bg-[#18181B] border border-[#787880] rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#787880] rounded-t-2xl">
            <span className="text-white text-xl font-semibold">Сповіщення</span>
            <button className="p-2 rounded-full hover:bg-[#23232A] transition" aria-label="Налаштування">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="px-4 py-2">
            <button
              className="text-[#A1A1AA] text-sm font-medium hover:text-white transition"
              onClick={markAllRead}
            >
              Позначити всі як прочитані
            </button>
          </div>

          <div className="px-4 max-h-[240px] overflow-y-auto">
            {notifications.length === 0 && (
              <div className="text-[#A1A1AA] text-center py-8">Сповіщень немає</div>
            )}
            {notifications.map((n) => (
              <a
                key={n.id}
                href={n.data.url}
                className="block rounded-2xl px-4 py-3 mb-3 bg-transparent transition-colors hover:bg-[#23232A]"
                onClick={onClose}
              >
                <div className="text-white font-medium text-sm mb-1">
                  {n.data.message}
                </div>
                <div className="text-[#787880] text-xs">
                  {new Date(n.created_at).toLocaleString("uk-UA", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                {n.read_at === null && (
                  <span className="w-2 h-2 bg-[#4B7FCC] rounded-full mt-1 inline-block" />
                )}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default NotificationModal;
