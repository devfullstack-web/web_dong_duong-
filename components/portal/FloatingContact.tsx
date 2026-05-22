'use client';

import React from 'react';
import { Phone, Facebook, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { COMPANY_INFO } from '@/constants/site-info';

const CONTACT_LINKS = [
    {
        name: 'Hotline',
        icon: <Phone className="w-5 h-5 fill-[#fbbf24] text-[#fbbf24]" />,
        href: `tel:${COMPANY_INFO.hotlineRaw}`,
        color: 'bg-[#002d6b]',
        pulse: true,
    },
    {
        name: 'Zalo',
        icon: <span className="text-[10px] font-black text-[#fbbf24] uppercase">Zalo</span>,
        href: COMPANY_INFO.social.zalo,
        color: 'bg-[#002d6b]',
    },
    {
        name: 'Facebook',
        icon: <Facebook className="w-5 h-5 fill-[#fbbf24] text-[#fbbf24]" />,
        href: COMPANY_INFO.social.facebook,
        color: 'bg-[#002d6b]',
    },
    {
        name: 'Email',
        icon: <Mail className="w-5 h-5 text-[#fbbf24]" />,
        href: `mailto:${COMPANY_INFO.email}`,
        color: 'bg-[#002d6b]',
    },
];

export default function FloatingContact() {
    return (
        <div className="fixed bottom-10 right-4 z-50 flex flex-col gap-3 items-center">
            {CONTACT_LINKS.map((contact, index) => (
                <motion.a
                    key={contact.name}
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                    }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        'relative group w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all border border-[#fbbf24]/20',
                        contact.color,
                    )}
                >
                    {contact.pulse && (
                        <div className="absolute inset-0 rounded-full">
                            <span className="absolute inset-0 rounded-full bg-[#fbbf24] opacity-20 animate-ping" />
                            <span className="absolute -inset-1 rounded-full border border-[#fbbf24]/30 animate-pulse" />
                        </div>
                    )}
                    {contact.icon}

                    {/* Tooltip on hover */}
                    <span className="absolute right-full mr-3 px-2 py-1 bg-[#002d6b] text-[#fbbf24] text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#fbbf24]/20 shadow-xl">
                        {contact.name}
                    </span>
                </motion.a>
            ))}
        </div>
    );
}
