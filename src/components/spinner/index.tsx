import xs, { Stream, MemoryStream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { IBaseSources, IBaseSinks } from '../../interfaces';
import './style.scss';
export function Spinner({ DOM }: IBaseSources): IBaseSinks {
    return {
        DOM: view()
    };
}

function view(): Stream<VNode> {
    return xs.of(
        <div className="spinner-container">
            <div className="spinner" />
        </div>
    );
}
