import { IModalHeaderProps } from '@/interfaces/shared/modal';
import styles from './styles.module.scss';

const ModalHeader = ({ description, title, }: IModalHeaderProps) => {
  return (
    <header className={styles.header}>
      <span className={styles.headerTitle}>
        {title}
      </span>
      {!!styles.headerSub && (
        <p className={styles.headerSub}>
          {description}
        </p>
      )}
    </header>
  );
}

export default ModalHeader;
