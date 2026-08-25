import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ISelectOption, useSelectContext } from '../../context';

import styles from './styles.module.scss';

interface ISelectedOptionProps<O extends ISelectOption<string, string>> {
  children: (item: O) => ReactNode;
  className?: string;
}

const SelectedOption = <O extends ISelectOption<string, string>>({
  children,
  className,
}: ISelectedOptionProps<O>) => {
  const { selectedOption, isOpen, search, searchable } = useSelectContext<O>();

  if (!selectedOption || (isOpen && search)) return null;

  return (
    <span className={cn(styles['selected-item'], className)}>
      {
        !(searchable && isOpen)
        ? children(selectedOption)
        : null
      }
    </span>
  );
};

export default SelectedOption;
