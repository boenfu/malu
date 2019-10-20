import { ObjectId, UpdateQuery, FilterQuery } from "mongodb";
import { Socket } from "socket.io";

import { SocketService, SocketEventListener, SocketId } from "./socket-service";
import { DBService } from "./db-service";
import { UserId, User, Message } from "../models";
import _ from "lodash";

export interface MessageSendOptions {
  content: string;
  to?: UserId;
}

export interface MessageInChatOptions {
  to: UserId;
}

export class MessageService {
  constructor(
    private socketService: SocketService,
    private dbService: DBService
  ) {
    this.initialize();
  }

  on(event: string, listener: SocketEventListener): MessageService {
    this.socketService.register(`msg:${event}`, listener);
    return this;
  }

  sendMessage(socket: Socket, message: Message): void {
    socket.emit("msg:send", message);
  }

  private async initialize(): Promise<void> {
    this.on("send", this.onSend)
      .on("list", this.onGetList)
      .on("history", this.onGetHistory)
      .on("in-chat", this.onInChat)
      .on("out-chat", this.onOutChat);
  }

  private onSend: SocketEventListener = async (
    socket,
    data: MessageSendOptions,
    callback
  ): Promise<void> => {
    if (!callback) {
      return;
    }

    const now = new Date();

    const info = this.socketService.getSocketInfoWithLogged(socket);

    if (!info) {
      return callback(false);
    }

    try {
      const {
        user: { id: from, inChatUser }
      } = info;

      const { content, to = inChatUser } = data;

      if (!to) {
        return callback(false);
      }

      const usersCollection = this.dbService.collection("users");

      const { value: user } = await usersCollection.findOneAndUpdate(
        buildUserFilterQuery(to),
        buildUpdateQuery(from, content)
      );

      if (!user) {
        return;
      }

      const messagesCollection = this.dbService.collection("messages");

      const {
        ops: [newMessage]
      } = await messagesCollection.insertOne({
        _id: new ObjectId(),
        from,
        to,
        content,
        unread: true,
        createAt: now
      });

      await usersCollection.findOneAndUpdate(
        buildUserFilterQuery(from),
        buildUpdateQuery(to, content)
      );

      if (inChatUser) {
        const inChatUserSocket = this.socketService.userToSocketMap.get(
          inChatUser
        )!;

        this.sendMessage(inChatUserSocket, newMessage);
      }

      callback(true);
    } catch (error) {
      callback(false);
      return;
    }
  };

  private onGetList: SocketEventListener = async (socket): Promise<void> => {
    const info = this.socketService.getSocketInfoWithLogged(socket);

    if (!info) {
      return;
    }

    const usersCollection = this.dbService.collection("users");

    const {
      user: { id }
    } = info;

    //TODO
  };

  private onGetHistory: SocketEventListener = async (socket): Promise<void> => {
    const info = this.socketService.getSocketInfoWithLogged(socket);

    if (!info) {
      return;
    }

    const newInfo = _.clone(info);

    newInfo.user.inChatUser = undefined;

    this.socketService.updateSocketInfo(socket.id as SocketId, newInfo);
  };

  private onInChat: SocketEventListener = async (
    socket,
    data: MessageInChatOptions
  ): Promise<void> => {
    const info = this.socketService.getSocketInfoWithLogged(socket);

    if (!info) {
      return;
    }

    try {
      const {
        user: { id: from }
      } = info;

      const { to } = Object(data);

      const usersCollection = this.dbService.collection("users");

      const user = await usersCollection.findOne(buildUserFilterQuery(to));

      if (!user) {
        return;
      }

      await usersCollection.findOneAndUpdate(buildUserFilterQuery(from), {
        $set: {
          [`chat.${to}`]: {
            count: 0,
            updateAt: new Date()
          }
        }
      });

      const newInfo = _.clone(info);

      newInfo.user.inChatUser = to;

      this.socketService.updateSocketInfo(socket.id as SocketId, newInfo);
    } catch (error) {}
  };

  private onOutChat: SocketEventListener = async (socket): Promise<void> => {
    const info = this.socketService.getSocketInfoWithLogged(socket);

    if (!info) {
      return;
    }

    const newInfo = _.clone(info);

    newInfo.user.inChatUser = undefined;

    this.socketService.updateSocketInfo(socket.id as SocketId, newInfo);
  };
}

function buildUserFilterQuery(user: UserId): FilterQuery<User> {
  return {
    _id: new ObjectId(user)
  };
}

function buildUpdateQuery(target: UserId, content: string): UpdateQuery<User> {
  const parent = `chat.${target}.`;

  return {
    $currentDate: {
      [`${parent}updateAt`]: true
    },
    $inc: {
      [`${parent}count`]: 1
    },
    $set: {
      [`${parent}id`]: new ObjectId(target),
      [`${parent}recently`]: content.slice(0, 24)
    }
  };
}
