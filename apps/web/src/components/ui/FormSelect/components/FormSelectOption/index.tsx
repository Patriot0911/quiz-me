import { ISelectOption, useSelectContext } from '../../context';
import { IFormSelectOptionProps } from './FormSelectOption';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const FormSelectOption = <O extends ISelectOption<string, string>>({
  children,
  className,
  disabled
}: IFormSelectOptionProps<O>) => {
  const { options, value, onChange, isOpen } = useSelectContext<O>();

  if (!isOpen) {
    return null;
  }

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

export default FormSelectOption;
