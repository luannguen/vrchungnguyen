import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import EditProfileModal from "../components/UserProfile/EditProfileModal";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  const { user, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <PageMeta
        title="Hồ sơ cá nhân | VRC Admin"
        description="Thông tin hồ sơ cá nhân của bạn"
      />
      <PageBreadcrumb pageTitle="Hồ sơ cá nhân" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Thông tin cá nhân
        </h3>
        <div className="space-y-6">
          <UserMetaCard
            user={user}
            onEdit={() => setIsEditModalOpen(true)}
          />
          <UserInfoCard user={user} />
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={() => {
          refreshUser();
        }}
      />
    </>
  );
}
