import Image from 'next/image';
import { BRAND_ICONS } from '@/constants';
import { AUTH_BRAND } from '../constants/auth-form.constants';

// Intrinsic ratio of public/icons/brand/logo.png (1024x920), so Next can reserve
// the right box while the card renders.
const LOGO_WIDTH = 96;
const LOGO_HEIGHT = 86;

export function AuthBrandLogo() {
  return (
    <Image
      src={BRAND_ICONS.logo}
      alt={AUTH_BRAND}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority
      className="mx-auto h-auto w-24"
    />
  );
}
