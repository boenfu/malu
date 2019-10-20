import socketIO, { Server as SocketServer, Socket } from "socket.io";
import { HttpService } from "./http-service";
import { AuthService, AuthOptions } from "./auth-service";
import { User, UserId } from "../models";
import { Nominal } from "tslang";

export type SocketId = Nominal<string, "socket-id">;

export interface SocketServiceOptions {
  port: number;
  path: string;
}

export type SocketEventListener = (
  socket: Socket,
  data: any,
  callback?: (...arg: any[]) => void
) => void;

export interface SocketInfo {
  socket: Socket;
  user: {
    id: UserId;
    account: User["account"];
    csr: User["csr"];
    inChatUser?: UserId;
  };
}

export class SocketService {
  private server!: SocketServer;

  private eventMap: Map<string, SocketEventListener> = new Map();

  private onlineUserMap: Map<SocketId, SocketInfo> = new Map();

  get userToSocketMap(): Map<UserId, Socket> {
    return new Map(
      [...this.onlineUserMap].map(([, { socket, user: { id } }]) => [
        id,
        socket
      ])
    );
  }

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private config: SocketServiceOptions
  ) {
    this.initialize();
  }

  async initialize(): Promise<void> {
    const httpService = this.httpService;
    const { path, port } = this.config;

    await httpService.ready;

    this.server = socketIO(httpService.server, {
      path
    }).listen(port);

    this.server.on("connection", async (socket: Socket) => {
      socket
        .on("disconnect", () => {
          this.onlineUserMap.delete(socket.id as SocketId);
        })
        .on("login", this.onLogin.bind(this, socket));
    });

    console.info(`SOCKET SERVICE RUNNING ON http://localhost:${port} ...`);
  }

  register(event: string, listener: SocketEventListener): void {
    this.eventMap.set(event, listener);
  }

  getSocketInfo(id: SocketId): SocketInfo | undefined {
    return this.onlineUserMap.get(id);
  }

  getSocketInfoWithLogged(socket: Socket): SocketInfo | undefined {
    const info = this.onlineUserMap.get(socket.id as SocketId);

    if (!info) {
      socket.disconnect(true);
    }

    return info;
  }

  updateSocketInfo(id: SocketId, info: SocketInfo): void {
    this.onlineUserMap.set(id, info);
  }

  private onLogin = async (
    socket: Socket,
    options: AuthOptions,
    callback: Function
  ): Promise<void> => {
    if (typeof options !== "object") {
      return callback(false);
    }

    const user = await this.authService.login(options);

    if (user) {
      const { account, csr } = options;

      this.onlineUserMap.set(socket.id as SocketId, {
        socket,
        user: {
          id: user._id.toHexString() as UserId,
          account,
          csr
        }
      });

      for (const [event, listener] of this.eventMap) {
        socket.on(event, listener.bind(undefined, socket));
      }
    }

    callback(!!user);
  };
}
