import { ISelectContext, ISelectOption } from '@/interfaces/ui/selectors';
import { createContext, useContext } from 'react';

export type { ISelectContext, ISelectOption };

export const SelectContext = createContext<ISelectContext<ISelectOption<string, string>> | null>(null);

export const useSelectContext = <O extends ISelectOption<string, string>>() => {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error('useSelectContext must be used within Select');
  }
  return ctx as ISelectContext<O>;
};
