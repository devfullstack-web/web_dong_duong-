'use client';

import React from 'react';
import { Phone, Facebook, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSiteInfo } from '@/components/providers/site-info-provider';

export default function FloatingContact() {
    const COMPANY_INFO = useSiteInfo();

    const CONTACT_LINKS = [
        {
            name: 'Hotline',
            icon: <Phone className="w-6 h-6 fill-white text-white" />,
            href: `tel:${COMPANY_INFO.hotlineRaw}`,
            color: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/40',
            pulse: true,
            label: COMPANY_INFO.hotline,
        },
        {
            name: 'Zalo',
            icon: <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">Zalo</span>,
            href: COMPANY_INFO.social.zalo,
            color: 'bg-[#0068FF] hover:bg-blue-600 shadow-blue-500/40',
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-6 h-6 fill-white text-white" />,
            href: COMPANY_INFO.social.facebook,
            color: 'bg-[#1877F2] hover:bg-blue-700 shadow-blue-600/40',
        },
        {
            name: 'Email',
            icon: <Mail className="w-6 h-6 text-white" />,
            href: `mailto:${COMPANY_INFO.email}`,
            color: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/40',
        },
    ];

    return (
        <div className="fixed bottom-8 right-4 sm:right-6 z-50 flex flex-col gap-3.5 items-center">
            {CONTACT_LINKS.map((contact, index) => (
                <motion.a
                    key={contact.name}
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={contact.name}
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.92 }}
                    className={cn(
                        'relative group w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-xl transition-all border-2 border-white/80 cursor-pointer',
                        contact.color,
                    )}
                >
                    {contact.pulse && (
                        <div className="absolute inset-0 rounded-full pointer-events-none">
                            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 animate-ping" />
                            <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/50 animate-pulse" />
                        </div>
                    )}
                    {contact.icon}

                    {/* Tooltip on hover / long tap */}
                    <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl rounded-md border border-white/10">
                        {contact.label ? `${contact.name}: ${contact.label}` : contact.name}
                    </span>
                </motion.a>
            ))}
        </div>
    );
}
