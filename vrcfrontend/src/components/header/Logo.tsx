import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img 
        src="/assets/svg/logo.svg" 
        alt="VRC - Tổng công ty Kỹ thuật lạnh Việt Nam" 
        className="h-[150px]"
      />
      {/* <span className="text-2xl font-bold text-primary">VRCORP</span> */}
    </Link>
  );
};

export default Logo;