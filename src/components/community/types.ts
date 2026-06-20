export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country?: string | null;
};

export type ParentMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};

export type MessageStatus = "pending" | "sent" | "failed";

export type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  profile?: Profile;
  parent?: ParentMessage;
  status?: MessageStatus;
};

export type ReplyTo = {
  id: string;
  name: string;
  preview: string;
} | null;
