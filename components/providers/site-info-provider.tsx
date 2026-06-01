'use client';

import React, { createContext, useContext } from 'react';
import { COMPANY_INFO } from '@/constants/site-info';

type CompanyInfoType = typeof COMPANY_INFO;

const SiteInfoContext = createContext<CompanyInfoType>(COMPANY_INFO);

export function SiteInfoProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: CompanyInfoType;
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
