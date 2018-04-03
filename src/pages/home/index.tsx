import xs, { Stream, MemoryStream } from "xstream";
import debounce from "xstream/extra/debounce";
import { VNode, div, DOMSource } from "@cycle/dom";
import "./style.scss";
import isolate from "@cycle/isolate";
import { IBaseSources, IBaseSinks, Reducer } from "../../interfaces";
import { SocialLogin } from "../../components/socialLogIn";

export function Home({ DOM, onion, OAuth, API }: IBaseSources) {
  const initReducer$ = xs.of<Reducer<any>>(
    prevState => (prevState === undefined ? {} : prevState)
  );

  const token$ = OAuth.map((res) => {
    return (state: any) => {
      return {
        ...state,
        test: 3,
        auth: res
      };
    };
  });

  //ex
  // const searchRequest$ = DOM.select('.refresh').events('click')
  //   .compose(debounce(500))
  //   .map((ev: any) =>  {
  //     return {
  //       url: `https://api.github.com/search/repositories?q=${encodeURI('test')}`,
  //       method: 'GET',
  //       action:'search'
  //     }
  //   })
  
  //   const gitHub$ = API.select<{total: number}>('search').flatten().map((el) => {
  //     return (state: any) => {
  //       return {
  //         ...state,
  //         ghub: el.data
  //       };
  //     };
  //   })
  //

  const routes$ = DOM.select('[data-action="navigate"]')
    .events("click")
    .mapTo("/counter");
  const props$ = xs.of({
    provider: "linkedin",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    clientId: "78lt5m22tyc3ef",
    scope: ["r_emailaddress", "r_basicprofile"]
  });

  const childSources = { DOM, props: props$ };
  const linkedinAuth = isolate(SocialLogin)({ DOM, props: props$, OAuth });

  return {
    DOM: view(xs.combine(onion.state$, linkedinAuth.DOM)),
    OAuth: linkedinAuth.OAuth,
    onion: initReducer$,
    //API: searchRequest$,
    router: routes$
  };
}

function view(usersResponse$: Stream<[any, any]>): Stream<VNode> {
  return usersResponse$.map(([results, linkDom]) => {
    console.log(results);
    return (
      <div className="ideachain-home">
        <div className="ideachain-home-text">
          <p>So, where do you store your</p>
          <h1>BIG IDEAS?</h1>
        </div>
        <div>{JSON.stringify(results)}</div>
        <div className="ideachain-home-social row">
          <div className="col">
            <button className="refresh">load users</button>
            <button type="button" data-action="navigate">
              Page 2
            </button>
            {linkDom}
            {/* <LinkedinButton
          clientId={config.socialInfo.linkedin}
          scope={["r_emailaddress", "r_basicprofile"]}
          onSuccess={loginSuccess}
          style={{ borderRadius: "100%", width: "55px" }}
          onFailure={loginFailure}
          returnUrl={returnUrl}
        /> */}
          </div>
          <div className="col">
            {/* <GoogleButton
          clientId={config.socialInfo.google}
          scope={["openid", "email"]}
          style={{ borderRadius: "100%", width: "55px" }}
          onSuccess={loginSuccess}
          returnUrl={returnUrl}
          onFailure={loginFailure}
        /> */}
          </div>
          <div className="col">
            {/* <FacebookButton
          clientId={config.socialInfo.facebook}
          scope={["public_profile", "email"]}
          style={{ borderRadius: "100%", width: "55px" }}
          onSuccess={loginSuccess}
          onFailure={loginFailure}
          returnUrl={returnUrl}
        /> */}
          </div>
        </div>
      </div>
    );
  });
}
