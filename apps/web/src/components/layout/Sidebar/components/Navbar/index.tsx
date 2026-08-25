import { SIDEBAR_ITEMS } from '@/configs/sidebar.config';
import { ISidebarSectionProps } from '@/interfaces/layout/sidebar';
import NavLink from '../NavLink';

import styles from './styles.module.scss';

const Navbar = ({ isOpen }: ISidebarSectionProps) => {
  return (
    <nav className={styles['nav-container']}>
      <ul className={styles['nav-list']}>
        {
          SIDEBAR_ITEMS.map(
            (item) => (
              <NavLink
                {...item}
                isOpen={isOpen}
                key={item.href}
              />
            )
          )
        }
      </ul>
    </nav>
  );
}

export default Navbar;
