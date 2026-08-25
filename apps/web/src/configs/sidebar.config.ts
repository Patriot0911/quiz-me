import type { INavbarItem } from '../interfaces/layout/sidebar';
import { GoHomeFill } from 'react-icons/go';
import { FaUserGraduate } from 'react-icons/fa6';

export const SIDEBAR_ITEMS: INavbarItem[] = [
  {
    href: '/',
    label: 'Home',
    exactPath: true,
    icon: GoHomeFill({}),
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: FaUserGraduate({}),
    isAuthenticated: true,
  },
] as const;
