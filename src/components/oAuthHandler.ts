import xs, { Stream, MemoryStream } from 'xstream';
import { IBaseSources, IBaseSinks, Reducer, AUTHTOKENKEY } from '../interfaces';
import { HistoryDriver } from '@cycle/history';

export function oAuthify(main: (a: any) => any) {
    return function(sources: IBaseSources): IBaseSinks {
        const initReducer$ = xs.of<Reducer<any>>(
            prevState => (prevState === undefined ? {} : prevState)
        );

        const authReq$ = xs
            .combine(
                sources.OAuth,
                (sources.storage as any).local.getItem(AUTHTOKENKEY)
            )
            .filter(([oauthRes, authToken]) => {
                return oauthRes.provider !== null && authToken === null;
            })
            .map(([res, nulltkn]) => {
                return {
                    url: 'sessions',
                    method: 'POST',
                    data: {
                        code: res.code,
                        provider: res.provider,
                        redirectUri: res.redirectUri
                    },
                    action: 'LOGIN'
                };
            });

        // token API responses
        const authRes$ = sources.API.select('LOGIN').flatten();
        const tokenRenewalRes$ = sources.API.select('TOKENRENEWAL').flatten();

        const authState$ = xs.merge(authRes$, tokenRenewalRes$).map(el => {
            return (state: any) => ({
                ...state,
                auth: el
            });
        });
        //

        const storeToken$ = sources.onion.state$
            .filter(
                state => state.auth && state.auth.data && state.auth.data.token
            )
            .map(state => ({
                key: AUTHTOKENKEY,
                value: state.auth.data.token
            }));

        const sinks = main(sources);

        return {
            ...sinks,
            onion: xs.merge(initReducer$, sinks.onion, authState$),
            API: xs.merge(sinks.API, authReq$),
            storage: xs.merge(sinks.storage, storeToken$)
        };
    };
}
