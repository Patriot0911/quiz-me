import type { INavbarItem } from '../interfaces/layout/sidebar';
import { GoHomeFill } from 'react-icons/go';
import { MdOutlineQuiz } from 'react-icons/md';

export const SIDEBAR_ITEMS: INavbarItem[] = [
  {
    href: '/',
    label: 'Home',
    exactPath: true,
    icon: GoHomeFill({}),
  },
  {
    label: 'Лобі',
    href: '/lobby',
    icon: MdOutlineQuiz({}),
    isAuthenticated: true,
  },
] as const;
