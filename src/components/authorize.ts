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

        const renewTokenReq$ = xs
            .combine(authStatus$, token$)
            .filter(
                ([isAuth, token]) =>
                    isAuth &&
                    tokenAboutToExpire(token as string, tokenExpiringLimit)
            )
            .map(([]) => ({
                url: 'sessions',
                method: 'GET',
                action: 'TOKENRENEWAL'
            }));

        const componentSinks$ = authStatus$.map(
            (authenticated: boolean) =>
                authenticated
                    ? main(sources)
                    : { router: xs.of(onUnhautorizedUrl) }
        );

        const sinks = extractSinks(componentSinks$, driverNames);

        return {
            ...sinks,
            API: xs.merge(sinks.API, renewTokenReq$)
        };
    };
}

function isTokenExpired(token: string): boolean {
    const tokenExp = getTokenExpiryTime(token);
    const current_time = getCurrentTime();
    return tokenExp < current_time;
}

function tokenAboutToExpire(token: string, limit: number) {
    const tokenExp = getTokenExpiryTime(token);
    const tokenExpTimestamp = new Date(tokenExp * 1000).getTime() / 1000;
    //const now = Date.now()
    //const now = Date.UTC()
    const current_time = getCurrentTime();
    const expDelta = tokenExpTimestamp - current_time;
    let minutesDifference = Math.floor(expDelta / 1000 / 60);
    debugger;
    return minutesDifference <= limit;
}

function getTokenExpiryTime(token: string) {
    const decoded = jwt.decode(token) as any;
    return decoded['exp'];
}

function getCurrentTime() {
    return Date.now() / 1000;
}
