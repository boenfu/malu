import {
  APIService,
  DBService,
  HttpService,
  SocketService,
  MessageService,
  AuthService,
  ManagerService,
  UserService
} from "./services";
import { config } from "./config";
import { buildRoutes } from "./route";

export type Services = {
  apiService: APIService;
  dbService: DBService;
  httpService: HttpService;
  socketService: SocketService;
};
export const managerService = new ManagerService();

export const apiService = new APIService();

export const dbService = new DBService(config.mongo);

const router = buildRoutes();

export const httpService = new HttpService(router, config.http);

export const authService = new AuthService(dbService, config.auth);

export const socketService = new SocketService(
  httpService,
  authService,
  config.socket
);

export const messageService = new MessageService(socketService, dbService);
export const userService = new UserService();
