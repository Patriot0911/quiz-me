import { Role } from '@/enums/role.enum';

export interface INavbarItem {
  label: string;
  href: string;
  exactPath?: boolean;
  icon?: React.ReactNode;
  roles?: Role[];
  isAuthenticated?: boolean;
};

export interface INavLinkProps extends INavbarItem {};
