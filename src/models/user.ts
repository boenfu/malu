import { IDocument } from "./document";
import { Nominal } from "tslang";

export type UserId = Nominal<string, "user-id">;

export interface UnreadInfo {
  user: UserId;
  count: number;
}

export interface User extends IDocument {
  account: string;
  username: string;
  password: string;
  csr: boolean;
  unreadList: UnreadInfo[];
}
