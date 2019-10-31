import { EventEmitter } from "events";
import { Services } from "../service-entrances";

export class ManagerService extends EventEmitter {
  private services!: Services;

  constructor() {
    super();
  }

  getService<T extends keyof Services>(key: T): Services[T] {
    return this.services[key];
  }

  addServices(services: Services): void {
    this.services = services;
  }
}
