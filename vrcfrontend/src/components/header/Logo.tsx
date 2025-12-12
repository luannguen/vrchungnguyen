import { Link } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';

const Logo = () => {
  const { settings } = useSettings();
  const logoSrc = settings['site_logo'] || '/assets/svg/logo.svg';

  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src={logoSrc}
        alt="VRC - Tổng công ty Kỹ thuật lạnh Việt Nam"
        className="h-[150px] object-contain"
      />
      {/* <span className="text-2xl font-bold text-primary">VRCORP</span> */}
    </Link>
  );
};

export default Logo;