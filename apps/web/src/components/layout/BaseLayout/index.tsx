import { PropsWithChildren } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import Footer from '../Footer';

import styles from './styles.module.scss';

const BaseLayout = ({ children, }: PropsWithChildren) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export default BaseLayout;
