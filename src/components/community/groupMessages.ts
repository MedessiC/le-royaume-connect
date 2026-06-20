import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import type { ChatMessage } from "./types";

const GROUP_THRESHOLD_MS = 5 * 60 * 1000;

export function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
      a.id.localeCompare(b.id),
  );
}

export function formatDayLabel(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return "Hier";
  return format(date, "d MMMM yyyy", { locale: fr });
}

export function formatMessageTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export type MessageRenderItem =
  | { type: "date"; label: string; key: string }
  | {
      type: "message";
      message: ChatMessage;
      showAvatar: boolean;
      showName: boolean;
      isGrouped: boolean;
      key: string;
    };

export function buildMessageRenderList(messages: ChatMessage[]): MessageRenderItem[] {
  const items: MessageRenderItem[] = [];
  let lastDate: Date | null = null;
  let lastAuthor: string | null = null;
  let lastTime: number | null = null;

  for (const message of sortMessages(messages)) {
    const date = new Date(message.created_at);

    if (!lastDate || !isSameDay(lastDate, date)) {
      items.push({
        type: "date",
        label: formatDayLabel(date),
        key: `date-${format(date, "yyyy-MM-dd")}`,
      });
      lastDate = date;
      lastAuthor = null;
      lastTime = null;
    }

    const time = date.getTime();
    const isGrouped =
      lastAuthor === message.user_id &&
      lastTime !== null &&
      time - lastTime < GROUP_THRESHOLD_MS;

    items.push({
      type: "message",
      message,
      showAvatar: !isGrouped,
      showName: !isGrouped,
      isGrouped,
      key: message.id,
    });

    lastAuthor = message.user_id;
    lastTime = time;
  }

  return items;
}
