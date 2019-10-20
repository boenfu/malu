import Router from "koa-router";
import { Services } from "../service-entrances";

export function buildRoutes({  }: Partial<Services>): Router {
  return new Router();
  // .use(buildCommonRoute(localService).routes())
}
