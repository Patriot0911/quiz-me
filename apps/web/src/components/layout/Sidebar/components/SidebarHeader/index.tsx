'use client';

import styles from './styles.module.scss';

const SidebarHeader = () => {
  return (
    <div className={styles['top-wrapper']}>
      <div className={styles['logo-wrapper']}>
        <span className={styles['logo-badge']}>Q</span>
        <span className={styles['logo-text']}>Quiz Me</span>
      </div>
    </div>
  );
}

export default SidebarHeader;
