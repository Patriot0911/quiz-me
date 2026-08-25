import { IModalContentProps } from '@/interfaces/shared/modal';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const ModalContent = ({ children, className, ...props }: IModalContentProps) => {
  return (
    <div
      {...props}
      className={cn(className, styles['modal-content'])}
      id={`modal-content${!!props.id ? `-${props.id}` : ''}`}
    >
      {children}
    </div>
  );
}

export default ModalContent;
