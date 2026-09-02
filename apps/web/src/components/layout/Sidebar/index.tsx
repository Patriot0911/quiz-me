'use client';

import Navbar from './components/Navbar';
import SidebarHeader from './components/SidebarHeader';
import UserSection from './components/UserSection';

import styles from './styles.module.scss';

const Sidebar = () => {
  return (
    <div className={styles['sidebar-wrapper']}>
      <aside className={styles['sidebar']}>
        <SidebarHeader />
        <Navbar />
        <UserSection />
      </aside>
    </div>
  );
}

export default Sidebar;
