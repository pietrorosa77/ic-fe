import xs, { Stream, MemoryStream } from "xstream";
import debounce from "xstream/extra/debounce";
import { VNode, div, DOMSource } from "@cycle/dom";

import { IBaseSources, IBaseSinks, Reducer } from "../interfaces";

interface ISocialLoginProps {
  provider: string;
  authorizeUrl: string;
  clientId: string;
  scope: string[];
}

export function SocialLogin({ DOM, props }: IBaseSources): IBaseSinks {
  const props$ = props as Stream<ISocialLoginProps>;
  const auth$ = DOM.select(`.socialBtn`).events(`click`);
  const authRequest$ = xs
    .combine(auth$.compose(debounce(500)), props$)
    .map(([evt, prop]) => {
      return {
        clientId: prop.clientId,
        authorizeUrl: prop.authorizeUrl,
        scope: prop.scope,
        provider: prop.provider
      };
    });

  const sinks = {
    DOM: view(),
    OAuth: authRequest$
  };
  return sinks;
}

function view(): Stream<VNode> {
  return xs.of(
    <div className="social">
      <button className="socialBtn">login with social</button>
    </div>
  );
}