import xs, { Stream, MemoryStream } from 'xstream';
import { IBaseSources, IBaseSinks, Reducer, AUTHTOKENKEY } from '../interfaces';
import * as jwt from 'jsonwebtoken';
import { VNode } from '@cycle/dom';
import { extractSinks } from 'cyclejs-utils';
import { driverNames } from '../drivers';

export function authorize(
    main: (a: any) => any,
    onUnhautorizedUrl: string,
    tokenExpiringLimit = 2
) {
    return function(sources: IBaseSources): IBaseSinks {
        const initReducer$ = xs.of<Reducer<any>>(
            prevState => (prevState === undefined ? {} : prevState)
        );

        const token$ = (sources.storage as any).local.getItem(AUTHTOKENKEY);

        const authStatus$ = token$.map(
            (token: string) =>
                token === null || isTokenExpired(token) ? false : true
        );

        const componentSinks$ = authStatus$.map(
            (authenticated: boolean) =>
                authenticated
                    ? main(sources)
                    : { router: xs.of(onUnhautorizedUrl) }
        );

        const sinks = extractSinks(componentSinks$, driverNames);

        return {
            ...sinks
        };
    };
}

function isTokenExpired(token: string): boolean {
    const tokenExp = getTokenExpiryTime(token);
    const current_time = getCurrentTime();
    return tokenExp < current_time;
}

function getTokenExpiryTime(token: string) {
    const decoded = jwt.decode(token) as any;
    return decoded['exp'];
}

function getCurrentTime() {
    return Date.now() / 1000;
}
