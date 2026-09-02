'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { VesperIcon, type VesperIconName } from './VesperIcon';
import './buttons.css';

type ButtonVariant = 'primary' | 'teal' | 'secondary' | 'soft' | 'danger';

export interface VesperButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: VesperIconName;
  iconAfter?: VesperIconName;
  large?: boolean;
  children: ReactNode;
}

export function VesperButton({
  variant = 'primary',
  icon,
  iconAfter,
  large,
  className = '',
  children,
  ...props
}: VesperButtonProps) {
  const classes = ['v-btn', `v-btn--${variant}`, large ? 'v-btn--large' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {icon ? <VesperIcon name={icon} /> : null}
      <span>{children}</span>
      {iconAfter ? <VesperIcon name={iconAfter} /> : null}
    </button>
  );
}
