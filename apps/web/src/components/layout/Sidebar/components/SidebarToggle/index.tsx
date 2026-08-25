'use client';

import { LuPanelLeftClose, LuPanelLeftOpen } from 'react-icons/lu';
import { cn } from '@/lib/cn';
import { ISidebarToggleProps } from '@/interfaces/layout/sidebar';

import styles from './styles.module.scss';

const SidebarToggle = ({ isOpen, changeOpen }: ISidebarToggleProps) => {
  return (
    <button
      type='button'
      className={cn(styles['toggle-button'], isOpen && styles['toggle-open'])}
      onClick={changeOpen}
      aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-expanded={isOpen}
    >
      {isOpen ? <LuPanelLeftClose /> : <LuPanelLeftOpen />}
    </button>
  );
}

export default SidebarToggle;
