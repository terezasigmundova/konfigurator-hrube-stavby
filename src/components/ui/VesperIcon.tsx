'use client';

import type { SVGProps } from 'react';

export type VesperIconName =
  | 'home'
  | 'check'
  | 'external-wall'
  | 'internal-wall'
  | 'floor-slab'
  | 'roof'
  | 'review'
  | 'order'
  | 'location'
  | 'storeys'
  | 'upload'
  | 'document'
  | 'calendar'
  | 'height'
  | 'ruler'
  | 'lock'
  | 'pan'
  | 'calibrate'
  | 'draw-wall'
  | 'draw-area'
  | 'opening'
  | 'stair-opening'
  | 'select'
  | 'move'
  | 'snap'
  | 'layers'
  | 'undo'
  | 'redo'
  | 'delete'
  | 'zoom-in'
  | 'zoom-out'
  | 'fit'
  | 'panel'
  | 'opening-large'
  | 'span'
  | 'fire'
  | 'truck'
  | 'crane'
  | 'installation'
  | 'site'
  | 'price'
  | 'calculation'
  | 'receipt'
  | 'complete'
  | 'warning'
  | 'review-needed'
  | 'info'
  | 'assumption'
  | 'saved'
  | 'edit'
  | 'save'
  | 'send'
  | 'next'
  | 'back'
  | 'expand'
  | 'collapse'
  | 'close'
  | 'plus'
  | 'minus'
  | 'search'
  | 'copy'
  | 'settings';

export interface VesperIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: VesperIconName;
  title?: string;
  spriteUrl?: string;
}

export function VesperIcon({
  name,
  title,
  spriteUrl = '/vesper-icons.svg',
  className = 'v-icon',
  ...props
}: VesperIconProps) {
  const iconHref = `${spriteUrl}#icon-${name}`;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <use href={iconHref} />
    </svg>
  );
}
