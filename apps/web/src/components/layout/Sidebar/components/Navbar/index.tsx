import { SIDEBAR_ITEMS } from '@/configs/sidebar.config';
import NavLink from '../NavLink';

import styles from './styles.module.scss';

const Navbar = () => {
  return (
    <nav className={styles['nav-container']}>
      <ul className={styles['nav-list']}>
        {
          SIDEBAR_ITEMS.map(
            (item) => (
              <NavLink
                {...item}
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
