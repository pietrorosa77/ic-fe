import xs, { Stream, MemoryStream } from 'xstream';
import debounce from 'xstream/extra/debounce';
import { VNode, div, DOMSource } from '@cycle/dom';
import isolate from '@cycle/isolate';
import {
    IBaseSources,
    IBaseSinks,
    Reducer,
    AUTHTOKENKEY,
    IHomeStructure,
    IBubblesStructure
} from '../../interfaces';
import { SocialLogin } from '../../components/socialLogIn';
import { Spinner } from '../../components/spinner';
import { config } from '../../config';
import './style.scss';

export function Home({ DOM, onion, OAuth, HTTP, storage }: IBaseSources) {
    const initReducer$ = xs.of<Reducer<any>>(
        prevState => (prevState === undefined ? {} : prevState)
    );

    const redirectAuthenticated$ = (storage as any).local
        .getItem(AUTHTOKENKEY)
        .filter((el: string) => el !== null)
        .mapTo('/my-ideas');

    const homepageDataRequest$ = onion.state$
        .filter(state => !state.home)
        .map(el => ({
            url: `http://${
                config.awsBucket
            }.s3.amazonaws.com/home/homePage.json`, // GET method by default
            category: 'homepage'
        }));

    const bubblesDataRequest$ = onion.state$
        .filter(state => !state.bubbles)
        .map(el => ({
            url: `http://${
                config.awsBucket
            }.s3.amazonaws.com/home/bubbles.json`, // GET method by default
            category: 'bubbles'
        }));

    const bubblesDataState$ = HTTP.select('bubbles').flatten();
    const homepageDataState$ = HTTP.select('homepage').flatten();
    const homeState$ = xs
        .combine(bubblesDataState$, homepageDataState$)
        .map(([bubbles, homeData]) => {
            return (state: any) => ({
                ...state,
                home: homeData.body as IHomeStructure[],
                bubbles: bubbles.body as IBubblesStructure[]
            });
        });

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

    const spinner = isolate(Spinner, 'spinner')({ DOM });

    return {
        DOM: view(
            xs.combine(
                onion.state$,
                linkedinAuth.DOM,
                googleAuth.DOM,
                facebookAuth.DOM,
                linkedinAuth.DOM,
                googleAuth.DOM,
                facebookAuth.DOM,
                spinner.DOM
            )
        ),
        OAuth: xs.merge(
            linkedinAuth.OAuth,
            googleAuth.OAuth,
            facebookAuth.OAuth
        ),
        HTTP: xs.merge(homepageDataRequest$, bubblesDataRequest$),
        onion: xs.merge(initReducer$, homeState$),
        router: redirectAuthenticated$
    };
}

function view(usersResponse$: Stream<any>): Stream<VNode> {
    return usersResponse$.map(
        ([
            state,
            linkDom,
            googDom,
            facebDom,
            linkDom2,
            googDom2,
            facebDom2,
            spinnerDom
        ]) => {
            const homepageData = state.home as IHomeStructure[];
            const authData = state.auth as { action: string; user: string };
            const bubbles = (state.bubbles as IBubblesStructure[]) || [];

            if (!homepageData) return spinnerDom;

            // TODO: random select from array
            const home = homepageData[0];
            const quote = home.footer.quotes[0];
            return (
                <div className="home container-fluid ">
                    <div className={`fullHeight ${home.theme}`}>
                        <div className="main fullHeight">
                            <div className="row align-items-end main-inner">
                                <div className="col">
                                    <div className="row">
                                        <div className="col-md-3" />
                                        <div className="col-12 col-md-6 col-sm-12 mb-1">
                                            <p>{home.main.line1}</p>
                                            <h1 className="text-white font-weight-bold">
                                                {home.main.line2}
                                            </h1>
                                            <p>{home.main.line3}</p>
                                            <h1 className="display-4 text-white font-weight-bold">
                                                {home.main.line4}
                                            </h1>
                                            <p>{home.main.line5}</p>
                                        </div>
                                        <div className="col-md-3" />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 col-sm-2 col-lg-4 col-1" />
                                        <div className="col">
                                            <div className="row justify-content-md-center mt-5">
                                                <div className="col">
                                                    <div className="mt-5 mb-4">
                                                        <div className="logoText text-white font-weight-bold">
                                                            IDEA<span className="gray">
                                                                CHAIN
                                                            </span>
                                                        </div>
                                                        <div className="text-white">
                                                            {home.main.logoLine}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {linkDom} {googDom}{' '}
                                                        {facebDom}
                                                    </div>
                                                    <div className="mt-4 font-weight-bold text-white">
                                                        {home.main.signInLine}
                                                    </div>
                                                    <div>
                                                        {
                                                            home.main
                                                                .signInDetails
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-sm-2 col-lg-4 col-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="list">
                            <div className="row">
                                <div className="col-8 p-5">
                                    <h2 className="text-dark font-weight-bold">
                                        {home.bulletList.title}
                                    </h2>
                                    <h5 className="text-dark">
                                        {home.bulletList.subTitle}
                                    </h5>
                                    <ul className="list-unstyled">
                                        {home.bulletList.list.map((el, i) => (
                                            <li className="container mt-5">
                                                <div className="row">
                                                    <div className="col-1 mr-5">
                                                        <div className="rounded-circle bg-white">
                                                            <div>{i + 1}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm ml-2 mt-2">
                                                        <h4 className="title text-dark font-weight-bold">
                                                            {el.title}
                                                        </h4>
                                                        <div className="details">
                                                            {el.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="col-3 network" />
                            </div>
                        </div>
                        <div
                            className="bubbles"
                            style={{ position: 'relative' }}
                        >
                            {bubbles.map((el, i) => (
                                <div
                                    className={`bubble rounded-circle x${i +
                                        1}`}
                                    style={{
                                        backgroundColor: `${
                                            home.boubbles.focusColor
                                        }`
                                    }}
                                >
                                    <div className="content">
                                        <h4 className="font-weight-bold text-white">
                                            {el.title}
                                        </h4>
                                        <h5 className=" text-white">
                                            {el.description}
                                        </h5>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="getMore pt-5">
                            <div className="row justify-content-center">
                                <div className="col-5 p-5 text-center">
                                    <h5 className="title text-dark font-weight-bold">
                                        {home.boubbles.signInArea.title}
                                    </h5>
                                    <div>
                                        {home.boubbles.signInArea.description}
                                    </div>
                                    <div className="mt-3">
                                        {linkDom2} {googDom2} {facebDom2}
                                    </div>
                                </div>
                                <div className="col-1 p-5 text-center">
                                    <div className="divider border fullHeight" />
                                </div>
                                <div className="col-5 p-5 text-center">
                                    <h5 className="title text-dark font-weight-bold">
                                        {home.boubbles.getMoreArea.title}
                                    </h5>
                                    <div>
                                        {home.boubbles.getMoreArea.description}
                                    </div>
                                    <a
                                        className="btn btn-primary mt-3"
                                        href={
                                            home.boubbles.getMoreArea
                                                .learnMoreUrl
                                        }
                                        role="button"
                                    >
                                        {
                                            home.boubbles.getMoreArea
                                                .learnMoreText
                                        }
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="footer mb-5 text-white p-5">
                            <div className="row border-bottom pb-3">
                                <div className="col-3">
                                    <div className="logoText text-white font-weight-bold">
                                        IDEA<span className="gray">CHAIN</span>
                                    </div>
                                    <div className="text-white">
                                        {home.main.logoLine}
                                    </div>
                                </div>
                                <div className="col-9 text-right">
                                    <blockquote className="blockquote">
                                        <p className="mb-0">{`" ${
                                            quote.title
                                        } "`}</p>
                                        <footer className="blockquote-footer">
                                            {quote.when}{' '}
                                            <cite title="Source Title">
                                                {quote.who}
                                            </cite>
                                        </footer>
                                    </blockquote>
                                </div>
                            </div>
                            <div className="text-right mt-3 text-capitalize">
                                <span className="mr-1">
                                    {home.footer.contacts.title}
                                </span>
                                <a href={home.footer.contacts.fb}>
                                    <img className="cUs fb ml-2" />
                                </a>{' '}
                                <a href={home.footer.contacts.twitt}>
                                    <img className="cUs tweet ml-2" />
                                </a>{' '}
                                <a href={home.footer.contacts.email}>
                                    <img className="cUs email ml-2" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    );
}
