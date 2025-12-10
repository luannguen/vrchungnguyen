import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { UserDTO } from "../data/types";
import { userService } from "../../services/userService";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserDTO;
    onSuccess?: () => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<UserDTO>>({});
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                fullName: user.fullName || "",
                phoneNumber: user.phoneNumber || "",
                location: user.location || "",
                bio: user.bio || "",
                socialLinks: {
                    facebook: user.socialLinks?.facebook || "",
                    twitter: user.socialLinks?.twitter || "",
                    linkedin: user.socialLinks?.linkedin || "",
                    instagram: user.socialLinks?.instagram || "",
                    github: user.socialLinks?.github || "",
                }
            });
            setAvatarPreview(user.avatarUrl || null);
            setAvatarFile(null);
        }
    }, [user, isOpen]);

    const handleChange = (field: keyof UserDTO, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (platform: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value
            }
        }));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        if (formData.phoneNumber && !/^\+?[\d\s-]{10,15}$/.test(formData.phoneNumber)) {
            alert("Invalid phone number format.");
            return false;
        }

        if (formData.socialLinks) {
            const urls = Object.values(formData.socialLinks);
            for (const url of urls) {
                if (url && !/^https?:\/\/.+/.test(url)) {
                    alert("Social links must start with http:// or https://");
                    return false;
                }
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        console.log("Saving profile with data:", formData); // Debug log

        setLoading(true);
        try {
            let avatarUrl = user.avatarUrl;

            // 1. Upload Avatar if selected
            if (avatarFile) {
                const uploadResult = await userService.uploadAvatar(user.id, avatarFile);
                if (uploadResult.success) {
                    avatarUrl = uploadResult.data;
                } else {
                    alert("Failed to upload avatar: " + uploadResult.error);
                    setLoading(false);
                    return;
                }
            }

            // 2. Update Profile with new Avatar URL and other data
            const updatePayload = {
                ...formData,
                avatarUrl: avatarUrl
            };
            console.log("Sending update payload:", updatePayload); // Debug log

            const result = await userService.updateProfile(user.id, updatePayload);
            if (result.success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                console.error("Failed to update profile:", result.error);
                alert("Failed to update profile: " + result.error);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Edit Personal Information
                    </h4>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                        Update your details to keep your profile up-to-date.
                    </p>
                </div>
                <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">

                        {/* Avatar Section */}
                        <div className="mb-7">
                            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                Public Profile
                            </h5>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                                            <span className="text-gray-400">No Img</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                        Upload New Photo
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Allowed JPG, GIF or PNG. Max size of 2MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                Social Links
                            </h5>

                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div>
                                    <Label>Facebook</Label>
                                    <Input
                                        type="text"
                                        value={formData.socialLinks?.facebook || ""}
                                        onChange={(e) => handleSocialChange("facebook", e.target.value)}
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>

                                <div>
                                    <Label>X.com (Twitter)</Label>
                                    <Input
                                        type="text"
                                        value={formData.socialLinks?.twitter || ""}
                                        onChange={(e) => handleSocialChange("twitter", e.target.value)}
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>

                                <div>
                                    <Label>Linkedin</Label>
                                    <Input
                                        type="text"
                                        value={formData.socialLinks?.linkedin || ""}
                                        onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                                        placeholder="https://linkedin.com/..."
                                    />
                                </div>

                                <div>
                                    <Label>Instagram</Label>
                                    <Input
                                        type="text"
                                        value={formData.socialLinks?.instagram || ""}
                                        onChange={(e) => handleSocialChange("instagram", e.target.value)}
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-7">
                            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                Personal Information
                            </h5>

                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Full Name</Label>
                                    <Input
                                        type="text"
                                        value={formData.fullName || ""}
                                        onChange={(e) => handleChange("fullName", e.target.value)}
                                    />
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Phone</Label>
                                    <Input
                                        type="text"
                                        value={formData.phoneNumber || ""}
                                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Location</Label>
                                    <Input
                                        type="text"
                                        value={formData.location || ""}
                                        onChange={(e) => handleChange("location", e.target.value)}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label>Bio</Label>
                                    <Input
                                        type="text"
                                        value={formData.bio || ""}
                                        onChange={(e) => handleChange("bio", e.target.value)}
                                        placeholder="Tell us a little about yourself..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={onClose} type="button">
                            Close
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={loading} type="submit">
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
