import { setup, run } from '@cycle/run';
import { buildDrivers, wrapMain } from './drivers';
import { Component } from './interfaces';
import { App } from './app';
/// #if DEVELOPMENT
import isolate from '@cycle/isolate';
import { restartable, rerunner } from 'cycle-restart';
/// #endif

const main: Component = wrapMain(App);
/// #if PRODUCTION
run(main as any, buildDrivers(([k, t]) => [k, t()]));

/// #else
const mkDrivers = () =>
    buildDrivers(([k, t]) => {
        if (k === 'DOM') {
            return [k, restartable(t(), { pauseSinksWhileReplaying: false })];
        }
        if (k === 'time' || k === 'router') {
            return [k, t()];
        }
        return [k, restartable(t())];
    });
const rerun = rerunner(setup, mkDrivers, isolate);
rerun(main as any);

if (module.hot) {
    module.hot.accept('./app', () => {
        const newApp = (require('./app') as any).App;

        rerun(wrapMain(newApp));
    });
}
/// #endif
