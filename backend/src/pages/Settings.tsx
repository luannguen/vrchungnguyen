import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Settings() {
    return (
        <>
            <PageMeta
                title="Cài đặt | VRC Admin"
                description="Cài đặt hệ thống VRC Admin"
            />
            <PageBreadcrumb pageTitle="Cài đặt" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                    Cài đặt hệ thống
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chức năng này đang được phát triển.
                </p>
            </div>
        </>
    );
}
