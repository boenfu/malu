import { DBService } from "./db-service";
import { User } from "../models";
import { ObjectId } from "mongodb";

export interface AuthOptions {
  account: User["account"];
  password: User["password"];
  csr: User["csr"];
}

export interface AuthServiceOptions {
  autoReg: boolean;
}

export class AuthService {
  constructor(
    private dbService: DBService,
    private config: AuthServiceOptions
  ) {}

  async login({ account, password, csr }: AuthOptions): Promise<User | false> {
    if (!account || !password || typeof csr !== "boolean") {
      return false;
    }

    const collection = this.dbService.collection("users");

    const user = await collection.findOne({
      account,
      csr
    });

    if (user) {
      return user.password === password ? user : false;
    }

    const { autoReg } = this.config;

    if (!autoReg) {
      return false;
    }

    const {
      ops: [newUser]
    } = await collection.insertOne({
      _id: new ObjectId(),
      account,
      username: account,
      password,
      csr,
      chat: {}
    });

    return newUser;
  }
}
