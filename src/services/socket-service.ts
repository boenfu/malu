import socketIO, { Server as SocketServer, Socket } from "socket.io";
import { HttpService } from "./http-service";

export interface SocketServiceOptions {
  port: number;
  path: string;
}

export class SocketService {
  private server!: SocketServer;

  constructor(
    private httpService: HttpService,
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

    console.info(`SOCKET SERVICE RUNNING ON http://localhost:${port} ...`);

    this.server.on("connection", async (socket: Socket) => {
      console.log("connection", typeof socket);
    });
  }
}
