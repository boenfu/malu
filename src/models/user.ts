import { IDocument } from "./document";
import { Nominal } from "tslang";

export type UserId = Nominal<string, "user-id">;

export interface UserChat {
  [user: string]: {
    id: UserId;
    count: number;
    recently: string;
    updateAt: Date;
  };
}

export interface User extends IDocument {
  account: string;
  username: string;
  password: string;
  csr: boolean;
  chat: UserChat;
}
