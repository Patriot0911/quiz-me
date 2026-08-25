'use client';

import { makeStore } from '@/store';
import { setGlobalStore } from '@/store/storeRef';
import { PropsWithChildren, useState, } from 'react'
import { Provider, } from 'react-redux'

const StoreProvider = ({ children, }: PropsWithChildren )  => {
  const [store] = useState(() => {
    const newStore = makeStore();
    setGlobalStore(newStore);
    return newStore;
  });

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

export default StoreProvider;
