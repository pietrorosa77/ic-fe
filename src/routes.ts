import xs from 'xstream';
import { Component, IBaseSources } from './interfaces';
import { MyIdeas } from './components/myIdeas';
import { authorize } from './components/authorize';
import { Home } from './pages/home';

export interface RouteValue {
    component: Component;
    scope: string;
}
export interface Routes {
    readonly [index: string]: RouteValue;
}

const initRoute = ({ router }: IBaseSources) => {
    return {
        router: xs.of('/home')
    };
};

export const routes: Routes = {
    '/': { component: initRoute, scope: 'homered' },
    '/home': { component: Home, scope: 'home' },
    '/my-ideas': { component: authorize(MyIdeas, '/home'), scope: 'myideas' }
};
