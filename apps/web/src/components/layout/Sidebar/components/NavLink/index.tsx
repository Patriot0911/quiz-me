'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { INavLinkProps } from '@/interfaces/layout/sidebar';
import { authStatusSelector } from '@/hooks/redux/auth';
import useMeQuery from '@/hooks/queries/auth/useMeQuery';

import styles from './styles.module.scss';

const NavLink = ({ href, label, icon, exactPath, isAuthenticated, roles, isOpen, }: INavLinkProps) => {
  const authStatus = useAppSelector(authStatusSelector);
  const { data: me, } = useMeQuery();
  const pathname = usePathname();

  const isActive = exactPath
    ? pathname === href
    : pathname.startsWith(href);

  if (isAuthenticated && authStatus !== 'authenticated') return null;
  if (roles && roles.length > 0 && (!me || !roles.includes(me.role))) return null;

  return (
    <li
      key={href}
      className={
        cn(
          styles['nav-item'],
          isActive && styles['active'],
          !isOpen && styles['collapsed']
        )
      }
    >
      <Link
        aria-current={isActive ? 'page' : undefined}
        title={label}
        href={href}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
}

export default NavLink;
