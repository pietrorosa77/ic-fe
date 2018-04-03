import xs from "xstream";
import { Component, IBaseSources } from "./interfaces";
import { Counter } from "./components/counter";
import { Home } from "./pages/home";

export interface RouteValue {
  component: Component;
  scope: string;
}
export interface Routes {
  readonly [index: string]: RouteValue;
}

const initRoute = ({ router }: IBaseSources) => {
  return {
    router: xs.of("/home")
  };
};

export const routes: Routes = {
  "/": { component: initRoute, scope: "homered" },
  "/home": { component: Home, scope: "home" },
  "/counter": { component: Counter, scope: "counter" }
};
