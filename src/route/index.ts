import Router from "koa-router";

export function buildRoutes(): Router {
  return new Router().all("*", async (ctx, next) => {
    console.log(ctx.path, new Date().toLocaleString());
    await next();
  });
}
