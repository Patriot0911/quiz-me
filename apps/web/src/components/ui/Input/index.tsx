import { IInputProps } from '@/interfaces/ui/inputs';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const Input = ({
  label,
  error,
  hint,
  bottomHint,
  icon,
  onIconClick,
  hideErrorMessage,
  hideHintOnError,
  touched,
  className,
  id,
  name,
  ...props
}: IInputProps) => {
  const inputId = id ?? name;
  const hasError = Boolean(error);

  return (
    <div className={styles.controller}>
      {
        (!!label || !!hint) && (
          <div className={styles['label-wrapper']}>
            {!!label && (
              <label
                htmlFor={inputId}
                className={cn(
                  hasError && styles['error-state']
                )}
              >
                {label} {!!props.required && ' *'}
              </label>
            )}
            {hint && !bottomHint && (!hasError || !hideHintOnError) && (
              <span className={styles.hint}>{hint}</span>
            )}
          </div>
        )
      }
      <div
        className={cn(
          className,
          styles['controller-input'],
          touched && styles['controller-input__touched'],
          hasError && styles['controller-input__error'],
          props.disabled && styles['controller-input__disabled'],
        )}
      >
        <input
          {...props}
          id={inputId}
          className={cn(
            (hasError && !touched) && styles['input__error']
          )}
          name={name}
          aria-invalid={hasError}
          aria-describedby={inputId ? `${inputId}-error` : undefined}
        />
        {icon && (
          <button type="button" className={styles['icon-button']} onClick={onIconClick}>
            {icon}
          </button>
        )}
      </div>
      <div className={styles.sub}>
        {hint && !!bottomHint && (!hasError || !hideHintOnError) && (
          <span className={styles.hint}>{hint}</span>
        )}
        {
          (
            !hideErrorMessage && (
              !hideHintOnError || (hideHintOnError && hasError)
            )
          ) && (
            <span className={styles['controller-error']} id={inputId ? `${inputId}-error` : undefined}>
              {error}
            </span>
          )
        }
      </div>
    </div>
  );
};

export default Input;
