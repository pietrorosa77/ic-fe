import xs, { Stream, MemoryStream } from 'xstream';
import { adapt } from '@cycle/run/lib/adapt';
import { DevToolEnabledSource } from '@cycle/run';
import * as R from 'ramda';

export function makeOAuthDriver(returnUrl: string) {
    function oAuthDriver(
        oauthEndpoint$: Stream<{
            clientId: string;
            authorizeUrl: string;
            scope: string[];
            provider: string;
        }>
    ) {
        oauthEndpoint$.addListener({
            next: item => {
                const csrfToken = Math.random()
                    .toString(36)
                    .substring(7);
                const url = getProviderAuthURL({
                    ...item,
                    returnUrl,
                    csrfToken
                });
                localStorage.setItem(
                    `OAUTHLOGIN`,
                    JSON.stringify({ csrfToken, provider: item.provider })
                );
                window.location.href = url;
            },
            error: () => {},
            complete: () => {}
        });

        const authRet = getAuthReturn(returnUrl);
        if (!authRet) return adapt(xs.never());

        const response$ = adapt(
            xs.create({
                start: listener => {
                    listener.next(authRet);
                    listener.complete();
                },
                stop: () => {}
            })
        );
        return response$;
    }

    return oAuthDriver;
}

function mapAuthItemToAuth0Querystring(item: {
    returnUrl: string;
    authorizeUrl: string;
    clientId: string;
    scope: string[];
    provider: string;
    csrfToken: string;
}) {
    return {
        response_type: 'code',
        client_id: item.clientId,
        redirect_uri: encodeURIComponent(item.returnUrl),
        state: item.csrfToken,
        scope: encodeURIComponent(item.scope.join(' '))
    };
}

function getProviderAuthURL(item: {
    returnUrl: string;
    authorizeUrl: string;
    clientId: string;
    scope: string[];
    provider: string;
    csrfToken: string;
}) {
    const url = R.compose(
        R.concat(`${item.authorizeUrl}?`),
        R.join('&'),
        R.map(R.join('=')),
        R.toPairs,
        mapAuthItemToAuth0Querystring
    )(item);
    return url;
}

function getAuthReturn(redirectUri: string) {
    const oauthLogin = localStorage.getItem(`OAUTHLOGIN`);
    localStorage.removeItem(`OAUTHLOGIN`);
    console.log('here!!!' + oauthLogin);
    if (!oauthLogin) return null;

    const ret = R.compose(
        R.fromPairs,
        R.map(R.split('=')) as any,
        R.split('&'),
        R.tail
    )(window.location.search) as any;

    const { provider, csrfToken } = JSON.parse(oauthLogin) as {
        provider: string;
        csrfToken: string;
    };

    if (
        ret.error ||
        !csrfToken ||
        !ret.state ||
        csrfToken !== ret.state ||
        !ret.code
    )
        throw new Error('unable to log in. Please try again later');

    return { provider, code: ret.code, redirectUri };
}
