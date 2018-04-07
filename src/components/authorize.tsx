import xs, { Stream, MemoryStream } from 'xstream';
import { IBaseSources, IBaseSinks, Reducer, AUTHTOKENKEY } from '../interfaces';
import * as jwt from 'jsonwebtoken';
import { VNode } from '@cycle/dom';
import { extractSinks } from 'cyclejs-utils';
import { driverNames } from '../drivers';

export function authorize(main: (a: any) => any, onUnhautorizedUrl: string) {
    return function(sources: IBaseSources): IBaseSinks {
        const initReducer$ = xs.of<Reducer<any>>(
            prevState => (prevState === undefined ? {} : prevState)
        );

        const token$ = (sources.storage as any).local.getItem(AUTHTOKENKEY);

        const authStatus$ = token$.map(
            (el: string) => (el === null || isTokenExpired(el) ? false : true)
        );
        const componentSinks$ = authStatus$.map((authenticated: boolean) => {
            debugger;
            return authenticated
                ? main(sources)
                : { router: xs.of(onUnhautorizedUrl) };
        });

        const sinks = extractSinks(componentSinks$, driverNames);

        return {
            ...sinks
        };
    };
}

/**
 * verifies just that the token isn't expired but not the signature of the token
 * @param token
 */
function isTokenExpired(token: string): boolean {
    debugger;
    const decoded = jwt.decode(token) as any;
    const current_time = Date.now() / 1000;
    return decoded['exp'] < current_time;
}
