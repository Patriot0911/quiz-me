import { ITableContext } from '@/interfaces/ui/table';
import { createContext, useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic context placeholder, narrowed by useTableContext<T>()
export const TableContext = createContext<ITableContext<any> | null>(null);

export const useTableContext = <T,>() => {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error('useTableContext must be used within Table');
  return ctx as ITableContext<T>;
};
