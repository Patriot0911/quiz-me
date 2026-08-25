import { InputHTMLAttributes, ReactNode } from 'react';
import { FieldValues, Path } from 'react-hook-form';

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  hideHintOnError?: boolean;
  bottomHint?: boolean;
  icon?: ReactNode;
  onIconClick?: () => void;
  hideErrorMessage?: boolean;
  touched?: boolean;
};

export interface IFormInputProps<T extends FieldValues>
  extends Omit<IInputProps, 'name' | 'error' | 'touched'> {
  name: Path<T>;
};
