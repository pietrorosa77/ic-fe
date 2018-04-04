import xs, { Stream, MemoryStream } from "xstream";
import debounce from "xstream/extra/debounce";
import { VNode, div, DOMSource } from "@cycle/dom";
import "./style.scss";
import isolate from "@cycle/isolate";
import { IBaseSources, IBaseSinks, Reducer, AUTHTOKENKEY } from "../../interfaces";
import { SocialLogin } from "../../components/socialLogIn";

export function Home({ DOM, onion, OAuth, API, storage }: IBaseSources) {
  const initReducer$ = xs.of<Reducer<any>>(
    prevState => (prevState === undefined ? {} : prevState)
  );

  const authReq$ = OAuth.map((res) => ({
    url: "sessions",
    method: "POST",
    data: {
      code: res.code,
      provider: res.provider,
      redirectUri: res.redirectUri
    },
    action: "LOGIN"
  }));

  const authRes$ = API.select("LOGIN").flatten().map((el) => {
    return (state: any) => ({
      ...state,
      auth: el
    });
  })

  const storeToken$ = onion.state$.filter((state) => (state.auth && state.auth.data))
    .map((state) => ({
      key: AUTHTOKENKEY,
      value: state.auth.data.token
    }))

  const redirectAuthenticated$ = storage.local
    .getItem(AUTHTOKENKEY).filter((el: string) => {
      return el !== null
    }).mapTo("/counter")

  const linProps$ = xs.of({
    provider: "linkedin",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    clientId: "78lt5m22tyc3ef",
    scope: ["r_emailaddress", "r_basicprofile"]
  });

  const googleProps$ = xs.of({
    provider: "google",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    clientId: "78lt5m22tyc3ef",
    scope: ["r_emailaddress", "r_basicprofile"]
  });

  const facebookProps$ = xs.of({
    provider: "facebook",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    clientId: "78lt5m22tyc3ef",
    scope: ["r_emailaddress", "r_basicprofile"]
  });

  const linkedinAuth = isolate(SocialLogin)({ DOM, props: linProps$, OAuth });
  const googleAuth = isolate(SocialLogin)({ DOM, props: googleProps$, OAuth });
  const facebookAuth = isolate(SocialLogin)({ DOM, props: facebookProps$, OAuth });

  return {
    DOM: view(xs.combine(onion.state$, linkedinAuth.DOM, googleAuth.DOM, facebookAuth.DOM)),
    OAuth: linkedinAuth.OAuth,
    onion: xs.merge(initReducer$, authRes$),
    API: authReq$,
    storage: storeToken$,
    router: redirectAuthenticated$
  };
}

function view(usersResponse$: Stream<[any, any, any, any]>): Stream<VNode> {
  return usersResponse$.map(([state, linkDom, googDom, facebDom]) => {
    return (
      <div className="ideachain-home">
        <div className="ideachain-home-text">
          <p>So, where do you store your</p>
          <h1>BIG IDEAS?</h1>
          <p className="small">if you answer any of [a] in my head, [b] in my disk </p>
        </div>
        <div className="ideachain-home-social row">
          <div className="col">
            {linkDom}
          </div>
          <div className="col">
            {googDom}
          </div>
          <div className="col">
            {facebDom}
          </div>
        </div>
      </div>
    );
  });
}
