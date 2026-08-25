import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ISelectOption, useSelectContext } from '../../context';

import styles from './styles.module.scss';

interface ISelectOptionProps<O extends ISelectOption> {
  className?: string;
  disabled?: boolean;
  children: (item: O, isSelected: boolean, isDisabled: boolean) => ReactNode;
}

const SelectOption = <O extends ISelectOption<string, string>>({
  children,
  className,
  disabled,
}: ISelectOptionProps<O>) => {
  const { options, value, onChange, isOpen } = useSelectContext<O>();

  if (!isOpen) return null;

  return (
    <>
      {options.map((item) => {
        const isSelected = item.value === value;

        return (
          <div
            key={String(item.value)}
            role="option"
            aria-selected={isSelected}
            className={cn(
              styles.option,
              isSelected && styles['option__selected'],
              disabled && styles['option__disabled'],
              className,
            )}
            onClick={() => onChange(item.value)}
          >
            {children(item, isSelected, !!disabled)}
          </div>
        );
      })}
    </>
  );
};

export default SelectOption;
