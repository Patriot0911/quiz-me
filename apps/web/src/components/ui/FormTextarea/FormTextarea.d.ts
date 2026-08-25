import { TextareaHTMLAttributes } from 'react';
import { FieldValues, Path } from 'react-hook-form';

export interface IFormTextareaProps<T extends FieldValues>
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: Path<T>;
  hint?: string;
  hideErrorMessage?: boolean;
}
