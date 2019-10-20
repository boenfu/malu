import * as services from "./service-entrances";

(async (): Promise<void> => {
  await services.dbService.ready;
  await services.httpService.ready;
})();
