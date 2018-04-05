import xs, { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';

import { IBaseSources, IBaseSinks, Reducer } from '../interfaces';

// State
export interface State {
    count: number;
}
export const defaultState: State = {
    count: 30
};

export function Counter({ DOM, onion, OAuth }: IBaseSources): IBaseSinks {
    const action$: Stream<Reducer<any>> = intent(DOM);
    const vdom$: Stream<VNode> = view(onion.state$);

    const routes$ = DOM.select('[data-action="navigate"]')
        .events('click')
        .mapTo('/home');

    return {
        DOM: vdom$,
        onion: action$,
        router: routes$
    };
}

function intent(DOM: DOMSource): Stream<Reducer<any>> {
    const init$ = xs.of<Reducer<any>>(
        prevState =>
            !prevState || !prevState.count
                ? { ...prevState, ...defaultState }
                : prevState
    );

    const add$: Stream<Reducer<any>> = DOM.select('.add')
        .events('click')
        .mapTo<Reducer<any>>(state => ({ ...state, count: state.count + 1 }));

    const subtract$: Stream<Reducer<any>> = DOM.select('.subtract')
        .events('click')
        .mapTo<Reducer<any>>(state => ({ ...state, count: state.count - 1 }));

    return xs.merge(init$, add$, subtract$);
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(state => {
        console.log(state);
        return (
            <div>
                <h2>My Awesome Cycle.js app - Page 1</h2>
                <span>{'Counter: ' + state.count}</span>
                <button type="button" className="add">
                    Increase
                </button>
                <button type="button" className="subtract">
                    Decrease
                </button>
                <button type="button" data-action="navigate">
                    Page 2
                </button>
            </div>
        );
    });
}
