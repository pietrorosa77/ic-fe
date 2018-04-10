import xs, { Stream } from 'xstream';
import { restartable } from 'cycle-restart';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { makeHistoryDriver } from '@cycle/history';
import { timeDriver } from '@cycle/time';
import { routerify, RouteMatcher } from 'cyclic-router';
import onionify from 'cycle-onionify';
import storageify from 'cycle-storageify';
import switchPath from 'switch-path';
import storageDriver from '@cycle/storage';
import { Component, AUTHTOKENKEY } from './interfaces';
import { makeOAuthDriver } from './drivers/oAuth';
import { makeAPIDriver } from './drivers/apiDriver';
import { oAuthify } from './components/oAuthHandler';

export type DriverThunk = Readonly<[string, () => any]> & [string, () => any]; // work around readonly
export type DriverThunkMapper = (t: DriverThunk) => DriverThunk;

// Set of Drivers used in this App
const driverThunks: DriverThunk[] = [
    ['DOM', () => makeDOMDriver('#app')],
    ['HTTP', () => makeHTTPDriver()],
    [
        'API',
        () =>
            makeAPIDriver(
                {
                    read: () => {
                        return localStorage.getItem(AUTHTOKENKEY) || undefined;
                    },
                    write: token => localStorage.setItem(AUTHTOKENKEY, token)
                },
                'https://fopggjizh8.execute-api.eu-west-1.amazonaws.com/prod'
            )
    ],
    ['time', () => timeDriver],
    ['history', () => makeHistoryDriver()],
    ['storage', () => storageDriver],
    ['OAuth', () => makeOAuthDriver('http://localhost:8090/home')]
];

export const buildDrivers = (fn: DriverThunkMapper) =>
    driverThunks
        .map(fn)
        .map(([n, t]: DriverThunk) => ({ [n]: t }))
        .reduce((a, c) => Object.assign(a, c), {});

export const driverNames = driverThunks
    .map(([n, t]) => n)
    .concat(['onion', 'router']);

export function wrapMain(main: Component): Component {
    return routerify(
        onionify(
            storageify(oAuthify(main) as any, {
                key: 'cycle-spa-state',
                debounce: 100 // wait for 100ms without state change before writing to localStorage
            })
        ),
        switchPath
    ) as any;
}
