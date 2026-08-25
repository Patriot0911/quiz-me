import { cn } from '@/lib/cn';
import { useSelectContext } from '../../context';
import { LuChevronDown } from 'react-icons/lu';
import { IFormSelectTriggerProps } from './FormSelectedTrigger';

import styles from './styles.module.scss';

const FormSelectTrigger = ({ className }: IFormSelectTriggerProps) => {
  const { isOpen, toggle } = useSelectContext();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(styles.trigger, className)}
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
}

export default FormSelectTrigger;
