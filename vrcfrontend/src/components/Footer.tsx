import React, { useEffect, useState } from 'react';
import { Facebook, Twitter, Linkedin, Youtube, Mail, Loader2 } from 'lucide-react';
import AppLink from '@/components/ui/app-link';
import { navigationService } from '@/services/navigationService';
import { settingsService } from '@/services/settingsService';
import { NavigationItem } from '@/components/data/types';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [footerMenus, setFooterMenus] = useState<NavigationItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [navResult, settingsResult] = await Promise.all([
          navigationService.getNavigationItems(),
          settingsService.getSettings()
        ]);

        if (navResult.success && navResult.data) {
          // Filter root items that are marked for footer
          // Note: The service returns built tree. We just filter roots.
          const footerRoots = navResult.data.filter(item => item.position === 'footer');
          setFooterMenus(footerRoots);
        }

        if (settingsResult.success && settingsResult.data) {
          setSettings(settingsResult.data);
        }
      } catch (error) {
        console.error("Failed to load footer data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyrightText = settings['copyright_text'] || `© ${new Date().getFullYear()} VRC - Tổng công ty kỹ thuật điện lạnh Việt Nam. Tất cả quyền được bảo lưu.`;
  const contactEmail = settings['contact_email'] || 'info@vrc.com.vn';
  const contactAddress = settings['contact_address'] || '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh, Việt Nam';
  const siteDescription = settings['site_description'] || 'Cung cấp giải pháp điện lạnh toàn diện cho mọi doanh nghiệp và công trình.';

  if (loading) return <footer className="bg-primary text-white py-12"><div className="flex justify-center"><Loader2 className="animate-spin" /></div></footer>;

  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Info & Socials */}
          <div>
            <div className="mb-4">
              <img
                src="/lovable-uploads/0bd3c048-8e37-4775-a6bc-0b54ec07edbe.png"
                alt="VRC Logo"
                className="h-16"
              />
            </div>
            <p className="text-gray-300 mb-6">
              {siteDescription}
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" className="text-gray-300 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://youtube.com" className="text-gray-300 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Dynamic Columns from Menu Manager */}
          {footerMenus.map((menu) => (
            <div key={menu.id}>
              <h4 className="text-white font-semibold mb-4">{menu.label}</h4>
              {menu.children && menu.children.length > 0 && (
                <ul className="space-y-2">
                  {menu.children.map((child) => (
                    <li key={child.id}>
                      {/* Handle both internal routeKeys (if AppLink uses them) or direct paths */}
                      {child.path.startsWith('/') ? (
                        <Link to={child.path} className="text-gray-300 hover:text-white transition-colors footer-link">
                          {child.label}
                        </Link>
                      ) : (
                        <a href={child.path} className="text-gray-300 hover:text-white transition-colors footer-link" target="_blank" rel="noopener noreferrer">
                          {child.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Fallback Static Columns if no footer menus exist (to prevent empty footer during migration) */}
          {footerMenus.length === 0 && (
            <>
              <div>
                <h4 className="text-white font-semibold mb-4">Liên kết nhanh (Default)</h4>
                <ul className="space-y-2">
                  <li><Link to="/about" className="footer-link">Về chúng tôi</Link></li>
                  <li><Link to="/products" className="footer-link">Sản phẩm</Link></li>
                  <li><Link to="/contact" className="footer-link">Liên hệ</Link></li>
                </ul>
              </div>
            </>
          )}

          {/* Column 4: Contact Info (Always present) */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <address className="not-italic text-gray-300 mb-4 space-y-2 whitespace-pre-line">
              {contactAddress}
            </address>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Mail size={16} className="mr-2" />
              {contactEmail}
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm mb-4 md:mb-0">
            {copyrightText}
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            {/* Dynamic legal links could be here, for now mapping standard legal pages */}
            <Link to="/legal/privacy" className="text-gray-300 hover:text-white footer-link">Chính sách bảo mật</Link>
            <Link to="/legal/terms" className="text-gray-300 hover:text-white footer-link">Điều khoản sử dụng</Link>
            <Link to="/legal/cookies" className="text-gray-300 hover:text-white footer-link">Chính sách cookie</Link>
            <Link to="/legal/sitemap" className="text-gray-300 hover:text-white footer-link">Sơ đồ trang</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
