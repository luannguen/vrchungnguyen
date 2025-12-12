import ContactForm from "@/components/ContactForm";
import { useSettings } from "@/hooks/useSettings";
import { Loader2 } from "lucide-react";

const Contact = () => {
  const { settings, loading } = useSettings();

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  const companyName = settings['company_name'] || 'Tổng công ty Kỹ thuật lạnh Việt Nam (VRC)';
  const slogan = settings['company_slogan'] || 'Tiên phong trong lĩnh vực kỹ thuật lạnh tại Việt Nam';
  const address = settings['contact_address'] || '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh';
  const phone = settings['contact_phone'] || '+84 (28) 1234 5678';
  const email = settings['contact_email'] || 'info@vrcorp.vn';
  const hotline = settings['contact_hotline'] || '1800 1234';
  const workingHours = settings['contact_working_hours'] || '8:00 - 17:30, Thứ 2 - Thứ 6';
  const mapEmbedUrl = settings['map_embed_url'] || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5177580567146!2d106.69916857465953!3d10.771594089387617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc7%3A0x4db964d76bf6e18e!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBCw6FjaCBLaG9hIC0gxJDhuqFpIEjhu41jIFF14buRYyBHaWEgVFAuSENN!5e0!3m2!1svi!2s!4v1712459678422!5m2!1svi!2s";

  const socials = [
    {
      key: 'social_facebook', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path>
        </svg>
      ), colorClass: 'text-blue-600 hover:text-blue-800'
    },
    {
      key: 'social_zalo', icon: (
        <img src="assets/svg/zalo.svg" alt="Zalo" className="w-6 h-6" />
      ), colorClass: 'hover:opacity-80'
    },
    {
      key: 'social_youtube', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.162 5.65593C21.3985 5.99362 20.589 6.2154 19.76 6.31393C20.6337 5.79136 21.2877 4.96894 21.6 3.99993C20.78 4.48793 19.881 4.82993 18.944 5.01493C18.3146 4.34151 17.4803 3.89489 16.5709 3.74451C15.6615 3.59413 14.7279 3.74842 13.9153 4.18338C13.1026 4.61834 12.4564 5.30961 12.0771 6.14972C11.6978 6.98983 11.6067 7.93171 11.818 8.82893C10.1551 8.74558 8.52832 8.31345 7.04328 7.56059C5.55823 6.80773 4.24812 5.75097 3.19799 4.45893C2.82628 5.09738 2.63095 5.82315 2.63199 6.56193C2.63199 8.01193 3.36999 9.29293 4.49199 10.0429C3.828 10.022 3.17862 9.84271 2.59799 9.51993V9.57193C2.59819 10.5376 2.93236 11.4735 3.54384 12.221C4.15532 12.9684 5.00647 13.4814 5.95299 13.6729C5.33661 13.84 4.6903 13.8646 4.06299 13.7449C4.32986 14.5762 4.85 15.3031 5.55058 15.824C6.25117 16.345 7.09712 16.6337 7.96999 16.6499C7.10247 17.3313 6.10917 17.8349 5.04687 18.1321C3.98458 18.4293 2.87412 18.5142 1.77899 18.3819C3.69069 19.6114 5.91609 20.2641 8.18899 20.2619C15.882 20.2619 20.089 13.8889 20.089 8.36193C20.089 8.18193 20.084 7.99993 20.076 7.82193C20.8949 7.23009 21.6016 6.49695 22.163 5.65693L22.162 5.65593Z"></path>
        </svg>
      ), colorClass: 'text-red-500 hover:text-red-700'
    }
  ];

  return (
    <main className="flex-grow">
      <div className="container-custom py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Liên hệ</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Thông tin liên hệ</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg text-primary">{companyName}</h3>
                  <p className="text-gray-600">{slogan}</p>
                </div>

                <div>
                  <h3 className="font-medium">Địa chỉ:</h3>
                  <p className="text-gray-600">{address}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Điện thoại:</h3>
                    <p className="text-gray-600">{phone}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Email:</h3>
                    <p className="text-gray-600">{email}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Hotline:</h3>
                    <p className="text-gray-600">{hotline}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Giờ làm việc:</h3>
                    <p className="text-gray-600">{workingHours}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Kết nối với chúng tôi:</h3>
                <div className="flex space-x-4">
                  {socials.map((social) => settings[social.key] ? (
                    <a
                      key={social.key}
                      href={settings[social.key]}
                      className={`${social.colorClass}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {social.icon}
                    </a>
                  ) : null)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Bản đồ</h2>
                <div className="aspect-video w-full h-full rounded-md overflow-hidden">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;