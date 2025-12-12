// Patch: Minimal cn utility to unblock build
export function cn(...args: any[]): string {
    return args.filter(Boolean).join(' ');
}

export function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}
