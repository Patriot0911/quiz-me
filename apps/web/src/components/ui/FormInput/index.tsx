import { FieldValues, useController, useFormContext } from 'react-hook-form';
import { IFormInputProps } from '@/interfaces/ui/inputs';
import Input from '@/components/ui/Input';

const FormInput = <T extends FieldValues>({
  name,
  hideErrorMessage,
  ...props
}: IFormInputProps<T>) => {
  const { control, formState: { isSubmitted } } = useFormContext<T>();
  const {
    field,
    fieldState: { error, isTouched, isDirty },
  } = useController({ name, control });

  const hasValue = Boolean(field.value);
  const touched = (isDirty || isTouched) && !error && hasValue;
  const showError = error && (isSubmitted || isDirty || hasValue);

  return (
    <Input
      {...props}
      {...field}
      value={field.value ?? ''}
      touched={touched}
      error={showError ? error.message : undefined}
      hideErrorMessage={hideErrorMessage}
    />
  );
};

export default FormInput;
