import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Height in pixels — width scales automatically */
  height?: number;
  /** Show as a plain image (no link wrapper) */
  noLink?: boolean;
  className?: string;
}

export function Logo({ height = 40, noLink = false, className }: LogoProps) {
  const img = (
    <Image
      src="/images/logo.png"
      alt="Ashimarket"
      width={height * 1}
      height={height}
      className={cn('object-contain', className)}
      priority
    />
  );

  if (noLink) return img;

  return (
    <Link href="/" aria-label="Ashimarket — home" className="shrink-0 flex items-center">
      {img}
    </Link>
  );
}
