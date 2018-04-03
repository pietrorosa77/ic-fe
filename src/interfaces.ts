import { Stream } from "xstream";
import { DOMSource, VNode } from "@cycle/dom";
import { StorageSource, StorageRequest } from "@cycle/storage";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { TimeSource } from "@cycle/time";
import { RouterSource, HistoryAction } from "cyclic-router";
import { StateSource } from "cycle-onionify";
import {APISource, IApiCallOption} from "./drivers/apiDriver"

export type Component = (s: IBaseSources) => IBaseSinks;

export interface IBaseSources {
  DOM: DOMSource;
  HTTP: HTTPSource;
  time: TimeSource;
  router: RouterSource;
  storage: StorageSource;
  onion: StateSource<any>;
  props?: any;
  API:APISource, 
  OAuth: Stream<{ provider: string; code: string }>;
}

export interface IBaseSinks {
  DOM?: Stream<VNode>;
  HTTP?: Stream<RequestOptions>;
  router?: Stream<HistoryAction>;
  storage?: Stream<StorageRequest>;
  speech?: Stream<string>;
  OAuth?: Stream<{
    clientId: string;
    authorizeUrl: string;
    scope: string[];
    provider: string;
  }>;
  API?: Stream<IApiCallOption>,
  onion?: Stream<any>;
}

export type Reducer<T> = (prev: T) => T | undefined;
