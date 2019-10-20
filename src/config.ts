export interface Config {
  http: {
    port: number;
    prefix: string;
  };
  socket: {
    port: number;
    path: string;
  };
  mongo: {
    uri: string;
    name: string;
  };
}

export const config = (require("../.config") as Config) || {};
