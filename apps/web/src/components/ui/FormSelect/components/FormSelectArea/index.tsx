import { cn } from '@/lib/cn';
import { useSelectContext } from '../../context';
import { IFormSelectAreaProps } from './FormSelectArea';

import styles from './styles.module.scss';

const FormSelectArea = ({ children, className, }: IFormSelectAreaProps) => {
  const { isOpen } = useSelectContext();

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn(styles.area, className)} role={'listbox'}>
      {children}
    </div>
  );
}

export default FormSelectArea;
