import { Stream } from 'xstream';
import { DOMSource, VNode } from '@cycle/dom';
import { StorageSource, StorageRequest } from '@cycle/storage';
import { HTTPSource, RequestOptions } from '@cycle/http';
import { TimeSource } from '@cycle/time';
import { RouterSource, HistoryAction } from 'cyclic-router';
import { StateSource } from 'cycle-onionify';
import { APISource, IApiCallOption } from './drivers/apiDriver';

export type Component = (s: IBaseSources) => IBaseSinks;

export interface IBaseSources {
    DOM: DOMSource;
    HTTP: HTTPSource;
    time: TimeSource;
    router: RouterSource;
    storage: StorageSource;
    onion: StateSource<any>;
    props?: any;
    API: APISource;
    OAuth: Stream<{ provider: string; code: string; redirectUri: string }>;
}

export interface IBaseSinks {
    DOM?: Stream<VNode>;
    HTTP?: Stream<RequestOptions>;
    router?: Stream<HistoryAction>;
    storage?: Stream<StorageRequest>;
    speech?: Stream<string>;
    OAuth?: Stream<any>;
    API?: Stream<IApiCallOption>;
    onion?: Stream<any>;
}

export interface IHomeStructure {
    theme: string;
    main: {
        line1: string;
        line2: string;
        line3: string;
        line4: string;
        line5: string;
        logoLine: string;
        signInLine: string;
        signInDetails: string;
    };
    bulletList: {
        title: string;
        subTitle: string;
        list: Array<{
            title: string;
            description: string;
        }>;
    };
    boubbles: {
        focusColor: string;
        signInArea: {
            title: string;
            description: string;
        };
        getMoreArea: {
            title: string;
            description: string;
            learnMoreUrl: string;
        };
    };
    footer: {
        contacts: Array<{
            title: string;
            fb: string;
            twitt: string;
            email: string;
        }>;
        quotes: Array<{ title: string; when: string; who: string }>;
    };
}

export interface IBubblesStructure {
    title: string;
    description: string;
}

export type Reducer<T> = (prev: T) => T | undefined;
export const AUTHTOKENKEY = 'AUTHTOKENKEY';

export const ACTIONS = {
    LOGIN: 'LOGIN'
};
