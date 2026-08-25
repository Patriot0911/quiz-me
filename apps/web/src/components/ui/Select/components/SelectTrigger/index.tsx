import { cn } from '@/lib/cn';
import { useSelectContext } from '../../context';
import { LuChevronDown } from 'react-icons/lu';

import styles from './styles.module.scss';

interface ISelectTriggerProps {
  className?: string;
  disabled?: boolean;
}

const SelectTrigger = ({ className, disabled }: ISelectTriggerProps) => {
  const { isOpen, toggle } = useSelectContext();

  return (
    <button
      type="button"
      onClick={() => !disabled && toggle()}
      className={cn(
        styles.trigger,
        className,
        disabled && styles['disabled']
      )}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      <LuChevronDown
        size={16}
        className={cn(
          styles['trigger-icon'],
          isOpen && styles['trigger-icon__open'],
        )}
      />
    </button>
  );
};

export default SelectTrigger;
