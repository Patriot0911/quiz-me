'use client';

import { FieldValues, useController, useFormContext } from 'react-hook-form';
import { ISelectOption } from '@/components/ui/Select/context';
import { ISelectProps } from '@/interfaces/ui/selectors';
import { IFormSelectProps } from './FormSelect';
import Select from '@/components/ui/Select';

const FormSelect = <T extends FieldValues, O extends ISelectOption<string, string>>({
  name,
  hideErrorMessage,
  ...props
}: IFormSelectProps<T, O>) => {
  const { control, formState: { isSubmitted } } = useFormContext<T>();
  const {
    field,
    fieldState: { error, isTouched, isDirty },
  } = useController({ name, control });

  const hasValue = Boolean(field.value);
  const touched = (isDirty || isTouched) && !error && hasValue;
  const showError = Boolean(error && (isSubmitted || isDirty || hasValue));

  return (
    <Select
      {...(props as Omit<ISelectProps<O>, 'value' | 'onChange' | 'error' | 'touched'>)}
      value={field.value}
      onChange={field.onChange}
      touched={touched}
      error={showError ? error?.message : undefined}
      hideErrorMessage={hideErrorMessage}
    />
  );
};

FormSelect.Option = Select.Option;
FormSelect.Selected = Select.Selected;
FormSelect.Area = Select.Area;
FormSelect.Trigger = Select.Trigger;
FormSelect.Search = Select.Search;

export default FormSelect;
