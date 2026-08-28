import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationService";
import type { AppNotification } from "../../types/domain";
import { formatDateTime } from "../../utils/helpers";

type NotificationBellProps = {
  linkPrefix?: string;
};

function NotificationBell({ linkPrefix }: NotificationBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const [items, count] = await Promise.all([
        notificationService.listNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(items.slice(0, 8));
      setUnread(count);
    } catch {
      // Keep host layout usable if notifications fail
    }
  };

  useEffect(() => {
    void loadNotifications();
    const timer = window.setInterval(() => void loadNotifications(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openNotification = async (item: AppNotification) => {
    if (!item.read) {
      await notificationService.markRead(item.id);
      setUnread((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    }
    setOpen(false);
    if (item.link) {
      const target =
        linkPrefix && item.link.startsWith("/work-orders/")
          ? item.link.replace("/work-orders/", "/portal/requests/")
          : item.link;
      navigate(target);
    }
  };

  const markAll = async () => {
    await notificationService.markAllRead();
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            {unread > 0 && (
              <button type="button" className="text-xs font-medium text-blue-600" onClick={() => void markAll()}>
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">No notifications yet</p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void openNotification(item)}
                  className={`block w-full border-b border-slate-50 px-3 py-3 text-left hover:bg-slate-50 ${
                    item.read ? "opacity-70" : "bg-blue-50/40"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(item.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
