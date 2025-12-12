import { useAchievements } from "@/hooks/useContent";

const AchievementsSection = () => {
    const { achievements, isLoading } = useAchievements();

    if (isLoading) return null;

    if (achievements.length === 0) return null;

    return (
        <section className="py-12 bg-accent/10">
            <div className="container-custom">
                <h2 className="text-center mb-10">Thành tựu của chúng tôi</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {achievements.map((item) => (
                        <div key={item.id} className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">{item.value}</div>
                            <p className="text-muted-foreground">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AchievementsSection;
