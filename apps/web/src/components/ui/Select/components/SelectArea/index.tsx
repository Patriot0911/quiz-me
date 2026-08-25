import { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';
import { useSelectContext } from '../../context';

import styles from './styles.module.scss';

interface ISelectAreaProps extends PropsWithChildren {
  className?: string;
}

const SelectArea = ({ children, className }: ISelectAreaProps) => {
  const { isOpen } = useSelectContext();

  if (!isOpen) return null;

  return (
    <div className={cn(styles.area, className)} role="listbox">
      {children}
    </div>
  );
};

export default SelectArea;
