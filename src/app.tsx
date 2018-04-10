import xs, { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import isolate from '@cycle/isolate';
import { extractSinks } from 'cyclejs-utils';

import { driverNames } from './drivers';
import { IBaseSources, IBaseSinks, Reducer } from './interfaces';
import { NotFound } from './pages/notFound';
import { RouteValue, routes } from './routes';

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

    const componentSinks$ = match$.map(
        ({ path, value }: { path: string; value: RouteValue }) => {
            const { component, scope } = value || {
                component: NotFound,
                scope: 'notfound'
            };
            return isolate(component, { scope, onion: authLense })({
                ...sources,
                router: sources.router.path(path || '/page-not-found')
            });
        }
    );

    const sinks = extractSinks(componentSinks$, driverNames);
    return {
        ...sinks,
        DOM: view(sinks.DOM),
        onion: xs.merge(initReducer$, sinks.onion)
    };
}

function view(childDOM: Stream<VNode>): Stream<VNode> {
    return childDOM.map(child => (
        <div className="container-fluid fullHeight">{child}</div>
    ));
}
