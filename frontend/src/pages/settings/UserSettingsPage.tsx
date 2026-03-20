import React from 'react';
import UserLayout from '../../components/UserLayout';
import PasswordSettingsSection from '../../components/PasswordSettingsSection';
import { useI18n } from '../../contexts/I18nContext';

const UserSettingsPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <UserLayout title={t('nav.settings')}>
      <div className="space-y-6">
        <section className="app-panel-warm p-6">
          <div className="inline-flex items-center rounded-full border border-[#f0d4c6] bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#b46c50]">
            Personal Settings
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#1d1713]">Secure your account and keep your access in control.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7a6d66]">
            This area uses the same control-surface language as the rest of the product, so account actions feel like part of the platform instead of a separate form screen.
          </p>
        </section>
        <PasswordSettingsSection />
      </div>
    </UserLayout>
  );
};

export default UserSettingsPage;
