import fetch, { BodyInit, Response } from "node-fetch";
import { Dict } from "tslang";

export const JSON_REQUEST_TYPE = "application/json;charset=UTF-8";
export const STREAM_REQUEST_TYPE = "application/octet-stream";

export interface APIServiceCallOptions {
  type?: string;
  headers?: Dict<string>;
}

export class APIService {
  async post(
    url: string,
    body?: BodyInit,
    { type = JSON_REQUEST_TYPE, headers }: APIServiceCallOptions = {}
  ): Promise<Response> {
    return this.call("POST", url, body, { type, headers });
  }

  async call(
    method: string,
    url: string,
    body?: BodyInit,
    { type = JSON_REQUEST_TYPE, headers }: APIServiceCallOptions = {}
  ): Promise<Response> {
    return fetch(url, {
      method,
      body,
      headers: {
        "Content-Type": type,
        ...headers
      }
    });
  }
}
