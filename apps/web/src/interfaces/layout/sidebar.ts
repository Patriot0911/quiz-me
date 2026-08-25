import { Role } from '@/enums/role.enum';

export interface INavbarItem {
  label: string;
  href: string;
  exactPath?: boolean;
  icon?: React.ReactNode;
  roles?: Role[];
  isAuthenticated?: boolean;
};

export interface ISidebarHeaderProps {
  isOpen: boolean;
};

export interface ISidebarToggleProps {
  isOpen: boolean;
  changeOpen: () => void;
};

export interface ISidebarSectionProps {
  isOpen: boolean;
};

export interface INavLinkProps extends INavbarItem {
  isOpen: boolean;
};
