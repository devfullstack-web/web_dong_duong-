'use client';

import * as React from 'react';
import { motion } from 'motion/react';

export default function Hero() {
    return (
        <section className="relative w-full bg-white pt-[80px] md:pt-[100px] lg:pt-[120px] pb-4 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                {/* 
                    Responsive Banner Wrapper:
                    Clean separation between image and content on small screens.
                */}
                <div className="relative w-full bg-slate-50 flex flex-col md:block">
                    {/* Image Area */}
                    <div className="relative w-full overflow-hidden leading-[0]">
                        <img
                            src="/images/banners/481264911_591002697270931_5782673037351412801_n.jpg"
                            alt="SG - VAL Brand Banner"
                            className="w-full h-auto block"
                        />
                    </div>
                    
                    {/* 
                        Adaptive Content: 
                        - On Mobile (< md): Displays below the image to avoid covering it.
                        - On Desktop (>= md): Overlays the image for a premium look.
                    */}
                    <div className="md:absolute md:inset-x-0 md:bottom-0 p-4 md:p-6 lg:p-8 flex justify-start items-end pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-white md:bg-white/95 md:backdrop-blur-md p-4 md:p-6 border-l-[4px] md:border-l-[5px] border-brand-primary shadow-lg md:shadow-xl pointer-events-auto w-full md:w-auto md:max-w-md lg:max-w-lg mt-2 md:mt-0"
                        >
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-brand-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                                        SG - VAL SOLUTIONS
                                    </span>
                                    <div className="hidden sm:block h-px w-6 md:w-8 bg-brand-primary/20"></div>
                                </div>
                                
                                <div className="space-y-1 md:space-y-1.5">
                                    <h1 className="text-sm md:text-xl lg:text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                                        GIẢI PHÁP IOT <span className="text-brand-primary">NGÀNH NƯỚC</span>
                                    </h1>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                                        Giám sát lưu lượng, áp lực thời gian thực, tối ưu vận hành và giảm thất thoát.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 border-t border-slate-100">
                                    {['Giám sát 24/7', 'SCADA'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
