import React from 'react';
import { Link } from 'react-router-dom';

interface AppLinkProps {
    routeKey: string;
    children: React.ReactNode;
    className?: string;
}

const ROUTES: Record<string, string> = {
    CONTACT: '/contact',
    PRODUCTS: '/products',
    PROJECTS: '/projects',
    SERVICES: '/services',
    HOME: '/',
    ABOUT: '/about',
    INTRO: '/intro',
    NEWS: '/news',
    EVENTS: '/events',
    PUBLICATIONS: '/publications',
};

export const AppLink: React.FC<AppLinkProps> = ({ routeKey, children, className }) => {
    const to = ROUTES[routeKey] || '#';
    return (
        <Link to={to} className={className}>
            {children}
        </Link>
    );
};
