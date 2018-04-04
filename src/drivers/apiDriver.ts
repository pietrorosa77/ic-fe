import xs, { Stream, MemoryStream } from 'xstream';
import { Driver } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import * as R from "ramda";

export function createResponse$(tokenProvider: () => string | undefined, reqOptions: IApiCallOption, apiUrl: string): Stream<{ action: string, data?: Response }> {
  const action = reqOptions.action
  return xs.create<{ action: string, data?: Response }>({
    start: async listener => {
      listener.next({ action: `${action}-START` });
      try {
        const result = await executeApiCall(
          `${apiUrl}/${reqOptions.url}`,
          reqOptions.method,
          reqOptions.data,
          tokenProvider()
        );
        listener.next({ action: `${action}-SUCCESS`, data: result });
      } catch (error) {
        listener.error({ action: `${action}-ERROR`, data: error });
      } finally {
        listener.complete()
      }
    },
    stop: () => { }
  });
}

export function makeAPIDriver(tokenProvider: () => string | undefined, apiUrl: string): Driver<Stream<IApiCallOption>, APISource> {
  function httpDriver(
    request$: Stream<IApiCallOption>,
    name: string
  ): APISource {
    const response$$ = request$.map(requestInputToResponse$.bind(null, tokenProvider, apiUrl));
    const httpSource = new APISource(response$$, name, []);
    response$$.addListener({
      next: () => { },
      error: () => { },
      complete: () => { },
    });
    return httpSource;
  }
  return httpDriver;
}

export interface IApiCallOption {
  url: string,
  method: string,
  data?: any,
  action: string,
  scope?: string[]
}

export class APISource {
  constructor(
    private _res$$: any,
    private _name: string,
    private _namespace: Array<string> = [],
  ) { }

  public filter(
    predicate: (request: IApiCallOption) => boolean,
    scope?: string,
  ): APISource {
    const filteredResponse$$ = this._res$$.filter((r$: any) => {
      return predicate(r$.request)
    });
    return new APISource(
      filteredResponse$$,
      this._name,
      scope === undefined ? this._namespace : this._namespace.concat(scope)
    );
  }

  public select<T>(action: string): Stream<MemoryStream<{ action: string, data?: T }>> {
    const res$$ = this._res$$.filter(
      (res$: any) => {
        return res$.request && res$.request.action === action
      },
    )
    const out = adapt(res$$);
    out._isCycleSource = this._name || action;
    return out as Stream<MemoryStream<{ action: string, data?: T }>>;
  }

  public isolateSource = function isolateSource(
    httpSource: APISource,
    scope: string | null,
  ): APISource {
    if (scope === null) {
      return httpSource;
    }
    return httpSource.filter(
      (request: IApiCallOption) =>
        Array.isArray(request.scope) &&
        R.equals(
          request.scope,
          (httpSource as any)._namespace.concat(scope),
        ),
      scope,
    );
  }
  public isolateSink = function isolateSink(
    request$: Stream<IApiCallOption>,
    scope: string | null,
  ): Stream<IApiCallOption> {
    if (scope === null) {
      return request$;
    }
    return request$.map((req: IApiCallOption) => {
      req.scope = req.scope || [];
      req.scope.unshift(scope)
      return req;
    });
  };
}

function requestInputToResponse$(tokenProvider: () => string, apiUrl: string, reqInput: IApiCallOption): MemoryStream<{ action: string, data?: Response }> {
  let response$ = createResponse$(tokenProvider, reqInput, apiUrl).remember();
  response$.addListener({
    next: () => { },
    error: () => { },
    complete: () => { },
  });
  response$ = adapt(response$);
  Object.defineProperty(response$, 'request', {
    value: reqInput,
    writable: false,
  });
  return response$;
}

async function executeApiCall(
  url: string,
  method: string,
  data?: any,
  token?: string
) {
  const requestOptions = buildRequestOptions(method, data || null, token);
  const response = await fetch(url, requestOptions);

  const ret = await response.json();

  if (!response.ok) {
    throw ret;
  } else {
    return ret;
  }
}

function buildRequestOptions(method: string, data?: any, token?: string): any {
  const headers: any = {
    "content-type": "application/json"
  };

  if (token) {
    headers.Authorization = token;
  }

  return {
    body: data ? JSON.stringify(data) : null, // must match 'Content-Type' header
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers,
    method, // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    redirect: "follow", // *manual, follow, error
    referrer: "no-referrer" // *client, no-referrer
  };
}
