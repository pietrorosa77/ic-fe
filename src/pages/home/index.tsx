import xs, { Stream, MemoryStream } from 'xstream';
import debounce from 'xstream/extra/debounce';
import { VNode, div, DOMSource } from '@cycle/dom';
import isolate from '@cycle/isolate';
import {
    IBaseSources,
    IBaseSinks,
    Reducer,
    AUTHTOKENKEY
} from '../../interfaces';
import { SocialLogin } from '../../components/socialLogIn';
import { config } from '../../config';
import './style.scss';

export function Home({ DOM, onion, OAuth, API, storage }: IBaseSources) {
    const initReducer$ = xs.of<Reducer<any>>(
        prevState => (prevState === undefined ? {} : prevState)
    );

    const linProps$ = xs.of({
        provider: 'linkedin',
        authorizeUrl: config.linkedinOAuthUrl,
        clientId: config.linkedinId,
        scope: config.linkedinScope
    });

    const googleProps$ = xs.of({
        provider: 'google',
        authorizeUrl: config.googleOAuthUrl,
        clientId: config.googleId,
        scope: config.googleScope
    });

    const facebookProps$ = xs.of({
        provider: 'facebook',
        authorizeUrl: config.facebookOAuthUrl,
        clientId: config.facebookId,
        scope: config.facebookScope
    });

    const linkedinAuth = isolate(SocialLogin, 'linkedin')({
        DOM,
        props: linProps$,
        OAuth
    });
    const googleAuth = isolate(SocialLogin, 'google')({
        DOM,
        props: googleProps$,
        OAuth
    });
    const facebookAuth = isolate(SocialLogin, 'facebook')({
        DOM,
        props: facebookProps$,
        OAuth
    });

    return {
        DOM: view(
            xs.combine(
                onion.state$,
                linkedinAuth.DOM,
                googleAuth.DOM,
                facebookAuth.DOM
            )
        ),
        OAuth: xs.merge(
            linkedinAuth.OAuth,
            googleAuth.OAuth,
            facebookAuth.OAuth
        ),
        onion: initReducer$
    };
}

function view(usersResponse$: Stream<[any, any, any, any]>): Stream<VNode> {
    return usersResponse$.map(([state, linkDom, googDom, facebDom]) => {
        return (
            <div className="ideachain-home">
                <div className="ideachain-home-text">
                    <p>So, where do you store your</p>
                    <h1>BIG IDEAS?</h1>
                    <p className="small">
                        if you answer any of [a] in my head, [b] in my disk{' '}
                    </p>
                </div>
                <div className="ideachain-home-social row">
                    <div className="col">{linkDom}</div>
                    <div className="col">{googDom}</div>
                    <div className="col">{facebDom}</div>
                </div>
            </div>
        );
    });
}
