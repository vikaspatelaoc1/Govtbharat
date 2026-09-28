import { loadWebsiteControlConfig, saveWebsiteControlConfig } from './websiteControlConfig';

export const DOMAIN_CHANGE_EVENT = 'GovtBharat_domain_name_changed';

export const getDomainName = (): string => {
  try {
    const directDomain = typeof localStorage !== 'undefined' ? localStorage.getItem('GovtBharat_custom_domain_name') : null;
    if (directDomain && directDomain.trim()) {
      return directDomain.trim();
    }
    const config = loadWebsiteControlConfig();
    return config.header?.domainName?.trim() || 'GovtBharat.com';
  } catch {
    return 'GovtBharat.com';
  }
};

export const getDomainNameLowercase = (): string => {
  return getDomainName().toLowerCase();
};

export const getDomainNameUppercase = (): string => {
  return getDomainName().toUpperCase();
};

export const updateDomainNameAcrossPortal = (newDomainName: string): boolean => {
  try {
    const cleanedDomain = newDomainName.trim();
    if (!cleanedDomain) return false;

    // 1. Direct local storage key for instant zero-latency retrieval
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('GovtBharat_custom_domain_name', cleanedDomain);
    }

    // 2. Update website control config structure
    const config = loadWebsiteControlConfig();
    if (!config.header) {
      config.header = {} as any;
    }
    config.header.domainName = cleanedDomain;
    
    // Also update footer email/copyright if default
    if (config.footer) {
      config.footer.copyrightText = `© 2026 ${cleanedDomain} - GovtBharat. All Rights Reserved.`;
      if (!config.footer.contactEmail || config.footer.contactEmail.includes('GovtBharat') || config.footer.contactEmail.includes('govtbharat')) {
        config.footer.contactEmail = `support@${cleanedDomain.toLowerCase()}`;
      }
    }

    saveWebsiteControlConfig(config);

    // 3. Dispatch custom browser event to update all active React components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DOMAIN_CHANGE_EVENT, { detail: { domainName: cleanedDomain } }));
      window.dispatchEvent(new Event('storage'));
    }

    return true;
  } catch (err) {
    console.error('Error updating domain name across portal:', err);
    return false;
  }
};

export const resetDomainNameToDefault = (): string => {
  const defaultDomain = 'GovtBharat.com';
  updateDomainNameAcrossPortal(defaultDomain);
  return defaultDomain;
};
