import { IDocument } from "./document";
import { Nominal } from "tslang";
import { UserId } from "./user";

export type MessageId = Nominal<string, "message-id">;

export enum MessageType {
  TEXT,
  IMAGE,
  AUDIO,
  FILE
}

export interface Message extends IDocument {
  from: UserId;
  to: UserId;
  type: MessageType;
  content: string;
  unread: boolean;
  createAt: Date;
}
