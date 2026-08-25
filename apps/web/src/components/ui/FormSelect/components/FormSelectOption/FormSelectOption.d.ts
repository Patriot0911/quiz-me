import { ReactNode } from 'react';
import { ISelectOption } from '../../context';

export interface IFormSelectOptionProps<O extends ISelectOption> {
  className?: string;
  disabled?: boolean;
  children: (item: O, isSelected: boolean, isDisabled: boolean) => ReactNode;
};
