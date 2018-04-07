import xs from 'xstream';
import './style.scss';

export function NotFound(sources: any) {
    return {
        DOM: view()
    };
}

function view() {
    return xs.of(<h1>PAGE NOT FOUND!</h1>);
}
