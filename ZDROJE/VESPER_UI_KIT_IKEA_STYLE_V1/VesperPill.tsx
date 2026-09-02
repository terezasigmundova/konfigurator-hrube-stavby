import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { VesperIcon, type VesperIconName } from './VesperIcon';
import './buttons.css';

export interface VesperPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: VesperIconName;
  selected?: boolean;
  children: ReactNode;
}

export function VesperPill({ icon, selected = false, children, ...props }: VesperPillProps) {
  return (
    <button className="v-pill" aria-pressed={selected} {...props}>
      <VesperIcon name={icon} />
      <span>{children}</span>
    </button>
  );
}
