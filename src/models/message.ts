import { IDocument } from "./document";
import { Nominal } from "tslang";
import { UserId } from "./user";

export type MessageId = Nominal<string, "tag-id">;

export interface Message extends IDocument {
  from: UserId;
  to: UserId;
  content: string;
  unread: boolean | undefined;
}
