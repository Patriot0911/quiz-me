'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { SelectContext } from './context';
import useOnClickOutside from '@/hooks/shared/useOnClickOutside';
import { ISelectOption, ISelectProps } from '@/interfaces/ui/selectors';
import SelectArea from './components/SelectArea';
import SelectOption from './components/SelectOption';
import SelectTrigger from './components/SelectTrigger';
import SelectedOption from './components/SelectedOption';
import SelectSearch from './components/SelectSearch';

import styles from './styles.module.scss';

const defaultFilterOption = <O extends ISelectOption<string, string>>(option: O, search: string) =>
  String(option.label).toLowerCase().includes(search.toLowerCase());

const Select = <O extends ISelectOption<string, string>>({
  value,
  onChange,
  options,
  label,
  hint,
  error,
  hideErrorMessage,
  placeholder = 'Select an option',
  className,
  required,
  touched,
  children,
  hideOptionalFlag,
  disabled,
  searchable,
  filterOption = defaultFilterOption,
}: ISelectProps<O>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);
  const ref = useRef<HTMLDivElement>(null);
  const hasValue = Boolean(value);
  const selectedOption = options.find((o) => o.value === value);
  const hasError = Boolean(error);
  const visibleOptions = searchable && search ? options.filter((o) => filterOption(o, search)) : options;

  const close = () => setIsOpen(false);

  useOnClickOutside(ref, close);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setSearch('');
  }

  return (
    <SelectContext.Provider
      value={{
        options: visibleOptions,
        value,
        selectedOption,
        onChange: (v) => {
          onChange(v);
          close();
        },
        isOpen,
        toggle: () => setIsOpen((prev) => !prev),
        close,
        showError: hasError,
        showTouched: Boolean(touched),
        searchable: Boolean(searchable),
        search,
        setSearch,
      }}
    >
      <div className={cn(styles.controller, className)} ref={ref}>
        {(label || (!required && !hideOptionalFlag)) && (
          <div className={styles['label-wrapper']}>
            {label && <label>{label}</label>}
            {!required && !hideOptionalFlag && <span className={styles['flag-optional']}>Optional</span>}
          </div>
        )}

        <div
          className={cn(
            styles['controller-select'],
            touched && !hasError && styles['controller-select__touched'],
            hasError && styles['controller-select__error'],
            disabled && styles['controller-select__disabled']
          )}
        >
          {children}
          {!hasValue && <span className={styles.placeholder}>{placeholder}</span>}
          <Select.Trigger
            disabled={disabled}
          />
        </div>

        {hint && <span className={styles.hint}>{hint}</span>}

        {!hideErrorMessage && (
          <span className={styles['controller-error']}>{error}</span>
        )}
      </div>
    </SelectContext.Provider>
  );
};

Select.Option = SelectOption;
Select.Selected = SelectedOption;
Select.Area = SelectArea;
Select.Trigger = SelectTrigger;
Select.Search = SelectSearch;

export default Select;
