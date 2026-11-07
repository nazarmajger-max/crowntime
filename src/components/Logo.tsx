import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => (
  <span
    role="img"
    aria-label="CrownTime"
    className={cn('font-wordmark font-medium uppercase leading-none tracking-[0.24em] -mr-[0.24em]', className)}
  >
    CrownTime
  </span>
);