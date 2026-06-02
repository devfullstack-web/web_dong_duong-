'use client';

import React, { createContext, useContext } from 'react';
import { COMPANY_INFO } from '@/constants/site-info';
import { SiteInfo } from '@/services/site-setting-service';

const defaultSiteInfo: SiteInfo = {
    name: COMPANY_INFO.name || '',
    shortName: COMPANY_INFO.shortName || '',
    fullName: COMPANY_INFO.fullName || '',
    address: COMPANY_INFO.address || '',
    phone: COMPANY_INFO.phone || '',
    phoneRaw: COMPANY_INFO.phoneRaw || '',
    hotline: COMPANY_INFO.hotline || '',
    hotlineRaw: COMPANY_INFO.hotlineRaw || '',
    email: COMPANY_INFO.email || '',
    supportEmail: COMPANY_INFO.supportEmail || '',
    website: COMPANY_INFO.website || '',
    websiteLabel: COMPANY_INFO.websiteLabel || '',
    social: {
        facebook: COMPANY_INFO.social.facebook || '',
        linkedin: COMPANY_INFO.social.linkedin || '',
        youtube: COMPANY_INFO.social.youtube || '',
        zalo: COMPANY_INFO.social.zalo || '',
    },
    workingHours: {
        weekdays: COMPANY_INFO.workingHours.weekdays || '',
        saturday: COMPANY_INFO.workingHours.saturday || '',
        sunday: COMPANY_INFO.workingHours.sunday || '',
    },
    taxCode: COMPANY_INFO.taxCode || '',
    foundedYear: COMPANY_INFO.foundedYear,
    slogan: COMPANY_INFO.slogan || '',
    copyright: COMPANY_INFO.copyright || '',
    raw: {},
};

const SiteInfoContext = createContext<SiteInfo>(defaultSiteInfo);

export function SiteInfoProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: SiteInfo;
}) {
    return (
        <SiteInfoContext.Provider value={value}>
            {children}
        </SiteInfoContext.Provider>
    );
}

export function useSiteInfo() {
    return useContext(SiteInfoContext);
}
