import { AppStore } from './index';

let _store: AppStore | undefined;

export const setGlobalStore = (store: AppStore) => {
  _store = store;
};

export const getGlobalStore = () => _store;
