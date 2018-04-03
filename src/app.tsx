import xs, { Stream } from "xstream";
import { VNode, DOMSource } from "@cycle/dom";
import { StateSource } from "cycle-onionify";
import isolate from "@cycle/isolate";
import { extractSinks } from "cyclejs-utils";

import { driverNames } from "./drivers";
import { IBaseSources, IBaseSinks, Reducer } from "./interfaces";
import { RouteValue, routes } from "./routes";

export function App(sources: IBaseSources): IBaseSinks {
  const initReducer$ = xs.of<Reducer<any>>(
    prevState => (prevState === undefined ? {} : prevState)
  );

  const match$ = sources.router.define(routes);

  const authLense = {
    get: (state: any) => ({ ...state }),
    set: (state: any, childState: any) => {
      return { ...state, ...childState };
    }
  };

  const componentSinks$ = match$
    .debug(`from router...`)
    .map(({ path, value }: { path: string; value: RouteValue }) => {
      const { component, scope } = value;
      return isolate(component, { scope, onion: authLense })({
        ...sources,
        router: sources.router.path(path)
      });
    });

  const sinks = extractSinks(componentSinks$, driverNames);
  return {
    ...sinks,
    onion: xs.merge(initReducer$, sinks.onion)
  };
}
