import xs, { Stream, MemoryStream } from 'xstream';
import {
    IBaseSources,
    IBaseSinks,
    Reducer,
    AUTHTOKENKEY,
    ACTIONS
} from '../interfaces';
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
                    action: ACTIONS.LOGIN
                };
            });

        const authResp$ = sources.API.select('LOGIN').flatten();
        const userState$ = authResp$.map((el: any) => {
            return (state: any) => ({
                ...state,
                auth: {
                    action: el.action,
                    user: el.data && el.data.user
                }
            });
        });

        const tokenStore$ = authResp$
            .filter((el: any) => el.data && el.data.token)
            .map((el: any) => ({
                key: AUTHTOKENKEY,
                value: el.data.token
            }));

        const sinks = main(sources);

        return {
            ...sinks,
            onion: xs.merge(initReducer$, sinks.onion, userState$),
            API: xs.merge(sinks.API, authReq$),
            storage: xs.merge(sinks.storage, tokenStore$)
        };
    };
}
