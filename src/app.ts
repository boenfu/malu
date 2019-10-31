import * as services from "./service-entrances";

(async (): Promise<void> => {
  const { managerService, ...rest } = services;

  managerService.addServices(rest);

  await services.dbService.ready;
  await services.httpService.ready;
})();
