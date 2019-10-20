import { APIService, DBService, HttpService, SocketService } from "./services";
import { config } from "./config";
import { buildRoutes } from "./route";

export type Services = {
  apiService: APIService;
  dbService: DBService;
  httpService: HttpService;
  socketService: SocketService;
};

export const apiService = new APIService();

export const dbService = new DBService(config.mongo);

const router = buildRoutes({ apiService, dbService });

export const httpService = new HttpService(router, config.http);

export const socketService = new SocketService(httpService, config.socket);
