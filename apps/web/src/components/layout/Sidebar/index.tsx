'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import Navbar from './components/Navbar';
import SidebarHeader from './components/SidebarHeader';
import SidebarToggle from './components/SidebarToggle';
import UserSection from './components/UserSection';

import styles from './styles.module.scss';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const changeOpen = () => setIsOpen((state) => !state);

  return (
    <div className={cn(styles['sidebar-wrapper'], isOpen && styles['sidebar-open'])}>
      <aside className={cn(styles['sidebar'], isOpen && styles['sidebar-open'])}>
        <SidebarHeader isOpen={isOpen} />
        <Navbar isOpen={isOpen} />
        <UserSection isOpen={isOpen} />
      </aside>
      <SidebarToggle isOpen={isOpen} changeOpen={changeOpen} />
    </div>
  );
}

export default Sidebar;
