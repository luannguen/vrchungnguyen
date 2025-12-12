import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teamService } from '@/services/teamService';
import { TeamMember } from '@/components/data/types';
import { Linkedin, Twitter, Facebook, Instagram, Mail } from 'lucide-react';

const TeamPage = () => {
    const { t } = useTranslation();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            setLoading(true);
            const result = await teamService.getAll();
            if (result.success) {
                setMembers(result.data);
            }
            setLoading(false);
        };

        fetchTeam();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center mb-12">
                <h2 className="text-base text-primary font-semibold tracking-wide uppercase">{t('our_team')}</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    {t('meet_our_experts')}
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
                    {t('team_description')}
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {members.map((member) => (
                    <div key={member.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                        <div className="relative h-64 overflow-hidden">
                            {member.image_url ? (
                                <img
                                    src={member.image_url}
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                    <span className="text-4xl">?</span>
                                </div>
                            )}
                            {/* Overlay with social links */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                                {member.social_links?.linkedin && (
                                    <a href={member.social_links.linkedin} target="_blank" rel="noreferrer" className="text-white hover:text-blue-400 transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20">
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                )}
                                {member.social_links?.twitter && (
                                    <a href={member.social_links.twitter} target="_blank" rel="noreferrer" className="text-white hover:text-blue-300 transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20">
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                )}
                                {member.social_links?.facebook && (
                                    <a href={member.social_links.facebook} target="_blank" rel="noreferrer" className="text-white hover:text-blue-600 transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20">
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                )}
                                {member.social_links?.instagram && (
                                    <a href={member.social_links.instagram} target="_blank" rel="noreferrer" className="text-white hover:text-pink-500 transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                )}
                                {member.social_links?.email && (
                                    <a href={`mailto:${member.social_links.email}`} className="text-white hover:text-red-400 transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20">
                                        <Mail className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                            <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                            {member.bio && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                                    {member.bio}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamPage;
