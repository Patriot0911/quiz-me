import { LoadingState } from '@/lib/loading-mappers';
import { FormHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export interface IModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
};

export interface IModalHeaderProps {
  title: string;
  description?: string;
};

export interface IModalFormBodyProps extends
PropsWithChildren,
FormHTMLAttributes<HTMLFormElement> {
  methods?: UseFormReturn<FieldValues>;
};

export type IModalContentProps = PropsWithChildren & HTMLAttributes<HTMLDivElement>;

export type IModalFooterProps = PropsWithChildren;

export interface IModalProps extends IModalBaseProps, PropsWithChildren {
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export interface IConfirmModalProps extends IModalBaseProps, PropsWithChildren {
  onConfirm: () => void;
  onCancel?: () => void;
  requestState?: LoadingState;
  disabled?: boolean;
  confirmationWord?: string;
  description?: string;
};
