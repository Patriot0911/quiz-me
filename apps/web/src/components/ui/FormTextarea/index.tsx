'use client';

import { FieldValues, useController, useFormContext } from 'react-hook-form';
import { IFormTextareaProps } from './FormTextarea';
import { cn } from '@/lib/cn';
import styles from './styles.module.scss';

const FormTextarea = <T extends FieldValues>({
  label,
  name,
  className,
  hint,
  hideErrorMessage,
  ...props
}: IFormTextareaProps<T>) => {
  const { control, formState: { isSubmitted } } = useFormContext<T>();
  const {
    field,
    fieldState: { error, isTouched, isDirty },
  } = useController({ name, control });

  const hasValue = Boolean(field.value);
  const showTouched = (isDirty || isTouched) && !error && hasValue;
  const showError = error && (isSubmitted || isDirty || hasValue);

  return (
    <div className={styles['controller']}>
      <div className={styles['label-wrapper']}>
        <label htmlFor={name}>{label}</label>
        {!props.required && (
          <span className={styles['flag-optional']}>Optional</span>
        )}
      </div>
      <div
        className={cn(
          className,
          styles['controller-input'],
          showTouched && styles['controller-input__touched'],
          showError && styles['controller-input__error'],
          props.disabled && styles['controller-input__disabled'],
        )}
      >
        <textarea
          {...field}
          {...props}
          id={name}
          aria-invalid={!!error}
          aria-describedby={`${name}-error`}
          value={field.value ?? ''}
        />
      </div>
      {hint && <span className={styles.hint}>{hint}</span>}
      {!hideErrorMessage && (
        <span className={styles['controller-error']} id={`${name}-error`}>
          {error?.message}
        </span>
      )}
    </div>
  );
};

export default FormTextarea;
