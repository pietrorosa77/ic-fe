import xs, { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';

import { IBaseSources, IBaseSinks, Reducer } from '../interfaces';

// // State
// export interface State {
//     count: number;
// }
// export const defaultState: State = {
//     count: 35
// };

export function MyIdeas({ DOM, onion, OAuth }: IBaseSources): IBaseSinks {
    // const action$: Stream<Reducer<any>> = intent(DOM);
    // const vdom$: Stream<VNode> = view(onion.state$);

    // const routes$ = DOM.select('[data-action="navigate"]')
    //     .events('click')
    //     .mapTo('/home');

    return {
        DOM: view()
        // onion: action$,
        // router: routes$
    };
}

// function intent(DOM: DOMSource): Stream<Reducer<any>> {
//     const init$ = xs.of<Reducer<any>>(
//         prevState =>
//             !prevState || !prevState.count
//                 ? { ...prevState, ...defaultState }
//                 : prevState
//     );

//     const add$: Stream<Reducer<any>> = DOM.select('.add')
//         .events('click')
//         .mapTo<Reducer<any>>(state => ({ ...state, count: state.count + 1 }));

//     const subtract$: Stream<Reducer<any>> = DOM.select('.subtract')
//         .events('click')
//         .mapTo<Reducer<any>>(state => ({ ...state, count: state.count - 1 }));

//     return xs.merge(init$, add$, subtract$);
// }

function view(): Stream<VNode> {
    return xs.of(
        <div>
            <h1>MY IDEAS</h1>
        </div>
    );
}
