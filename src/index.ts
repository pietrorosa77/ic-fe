import { run } from '@cycle/run';
import { buildDrivers, wrapMain } from './drivers';
import { Component } from './interfaces';
import { App } from './app';

const main: Component = wrapMain(App);
run(main as any, buildDrivers(([k, t]) => [k, t()]));
