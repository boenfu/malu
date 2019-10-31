import { Collection, Db, MongoClient } from "mongodb";
import { User, Message } from "../models";

export interface NameToCollectionDocumentSchemaDict {
  users: User;
  messages: Message;
}

export interface DBServiceOptions {
  uri: string;
  name: string;
}

export class DBService {
  private db!: Db;

  readonly ready: Promise<void>;

  constructor(options: DBServiceOptions) {
    this.ready = this.initialize(options);
  }

  async collection<TName extends keyof NameToCollectionDocumentSchemaDict>(
    name: TName
  ): Promise<Collection<NameToCollectionDocumentSchemaDict[TName]>> {
    await this.ready;
    return this.db.collection(name);
  }

  private async initialize({ uri, name }: DBServiceOptions): Promise<void> {
    try {
      const client = await MongoClient.connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        ignoreUndefined: true
      });

      this.db = client.db(name);

      console.info(`MONGODB RUNNING ON ${uri} ...`);
    } catch (error) {
      console.info(`MONGODB CONNECT TIMEOUT ${uri} ...`);
    }
  }
}
