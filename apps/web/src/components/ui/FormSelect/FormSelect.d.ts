import { FieldValues, Path } from 'react-hook-form';
import { ISelectProps } from '@/components/ui/Select/Select';
import { ISelectOption } from '@/components/ui/Select/context';

export interface IFormSelectProps<T extends FieldValues, O extends ISelectOption<string, string>>
  extends Omit<ISelectProps<O>, 'value' | 'onChange' | 'error' | 'touched'> {
  name: Path<T>;
}
