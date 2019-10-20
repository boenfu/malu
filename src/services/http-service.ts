import path from "path";
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import koaStatic from "koa-static";
import { Server } from "http";

export interface HttpServiceOptions {
  prefix: string;
  port: number;
}

export class HttpService {
  readonly app = new Koa();

  readonly ready: Promise<void>;

  server!: Server;

  constructor(router: Router, private config: HttpServiceOptions) {
    this.app
      .use(koaStatic(path.join(__dirname, "../../static")))
      .use(bodyParser());

    this.ready = this.initialize(router);
  }

  private async initialize(router: Router["routes"]): Promise<void>;
  private async initialize(routes: Router): Promise<void>;
  private async initialize(r: Router["routes"] | Router): Promise<void> {
    const { prefix, port } = this.config;

    const router = new Router({ prefix });

    router.use("routes" in r ? r.routes() : r);

    this.server = this.app
      .use(router.routes())
      .listen(port, () =>
        console.info(`HTTP SERVICE RUNNING ON http://localhost:${port} ...`)
      );
  }
}
