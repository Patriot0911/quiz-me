import { IButtonProps } from '@/interfaces/ui/buttons';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}: IButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        isLoading && styles.loading,
        className
      )}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner} />}

      {!isLoading && leftIcon && (
        <span className={styles.icon}>{leftIcon}</span>
      )}

      <span className={styles.content}>{children}</span>

      {!isLoading && rightIcon && (
        <span className={styles.icon}>{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
