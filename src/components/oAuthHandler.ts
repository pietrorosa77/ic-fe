import xs, { Stream, MemoryStream } from 'xstream';
import { IBaseSources, IBaseSinks, Reducer, AUTHTOKENKEY } from '../interfaces';

export function oAuthify(main: (a: any) => any, redirectAfterLogin?: string) {
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

        const authRes$ = sources.API.select('LOGIN')
            .flatten()
            .map(el => {
                return (state: any) => ({
                    ...state,
                    auth: el
                });
            });

        const storeToken$ = sources.onion.state$
            .filter(state => state.auth && state.auth.data)
            .map(state => ({
                key: AUTHTOKENKEY,
                value: state.auth.data.token
            }));

        const redirectAuthenticated$ = redirectAfterLogin
            ? (sources.storage as any).local
                  .getItem(AUTHTOKENKEY)
                  .filter((el: string) => {
                      return (
                          el !== null &&
                          !window.location.href.includes(redirectAfterLogin)
                      );
                  })
                  .mapTo(redirectAfterLogin)
            : xs.never();

        const sinks = main(sources);

        return {
            ...sinks,
            onion: xs.merge(initReducer$, sinks.onion, authRes$),
            API: xs.merge(sinks.API, authReq$),
            storage: xs.merge(sinks.storage, storeToken$),
            router: xs.merge(sinks.router, redirectAuthenticated$)
        };
    };
}