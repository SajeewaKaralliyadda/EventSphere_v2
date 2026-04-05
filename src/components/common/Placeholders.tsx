import React from 'react';
import GlobalNavbar from '../ui/GlobalNavbar';
import SidebarLayout from '../ui/SidebarLayout';

const PublicPlaceholder = ({ title, description }: { title: string, description: string }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
    <GlobalNavbar />
    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg">{description}</p>
    </div>
  </div>
);

const PrivatePlaceholder = ({ title, description }: { title: string, description: string }) => (
  <SidebarLayout>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  </SidebarLayout>
);

export const EventsList = () => <PublicPlaceholder title="All Events" description="Browse and search all upcoming events across universities." />;
export const UniversitiesList = () => <PublicPlaceholder title="Universities" description="Explore our partner universities and their communities." />;
export const OrganizerProfile = () => <PublicPlaceholder title="Organizer Profile" description="View public profile and upcoming events for this organizer." />;
export const SetupAdmin = () => <PublicPlaceholder title="Setup Admin" description="Initial setup wizard for new tenant administrators." />;

export const UserSettings = () => <PrivatePlaceholder title="Account Settings" description="Manage your personal profile, preferences, and security." />;
