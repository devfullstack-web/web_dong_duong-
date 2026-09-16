'use client';

import * as React from 'react';

export type TechBackgroundVariant =
    | 'tiles-porcelain'
    | 'hvac-chiller'
    | 'industrial-equipment'
    | 'smart-workflow'
    | 'partner-network'
    | 'ecommerce-portal'
    | 'blueprint'
    | 'honeycomb'
    | 'circuit'
    | 'ecommerce-grid'
    | 'network'
    | 'flow';

export type TechGlowColor = 'cyan' | 'amber' | 'blue' | 'mixed';

interface TechSvgBackgroundProps {
    variant?: TechBackgroundVariant;
    glowColor?: TechGlowColor;
    className?: string;
    showOrbs?: boolean;
    children?: React.ReactNode;
}

export default function TechSvgBackground({
    variant = 'ecommerce-portal',
    glowColor = 'mixed',
    className = '',
    showOrbs = true,
    children,
}: TechSvgBackgroundProps) {
    const id = React.useId().replace(/:/g, '');

    // Canonical variant mapping for business products
    const canonicalVariant = React.useMemo(() => {
        if (variant === 'blueprint') return 'tiles-porcelain';
        if (variant === 'flow') return 'hvac-chiller';
        if (variant === 'honeycomb') return 'industrial-equipment';
        if (variant === 'circuit') return 'smart-workflow';
        if (variant === 'network') return 'partner-network';
        if (variant === 'ecommerce-grid') return 'ecommerce-portal';
        return variant;
    }, [variant]);

    return (
        <div
            className={`overflow-hidden pointer-events-none select-none ${
                className.includes('absolute') ? '' : 'relative'
            } ${className}`}
            style={{ contain: 'paint' }}
        >
            {/* 1. Ambient Dynamic Lighting Orbs (Optimized for Mobile & PC 60fps) */}
            {showOrbs && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none contain-paint">
                    {/* Top Right Ambient Glow */}
                    <div
                        className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 lg:-top-32 lg:-right-32 w-48 h-48 sm:w-72 sm:h-72 lg:w-[26rem] lg:h-[26rem] rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-tech-pulse-glow pointer-events-none transform-gpu"
                        style={{
                            background:
                                glowColor === 'amber'
                                    ? 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%)'
                                    : glowColor === 'cyan'
                                    ? 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)'
                                    : glowColor === 'blue'
                                    ? 'radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, transparent 70%)'
                                    : 'radial-gradient(circle, rgba(245, 158, 11, 0.13) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 75%)',
                        }}
                    />

                    {/* Bottom Left Ambient Glow */}
                    <div
                        className="absolute -bottom-16 -left-16 sm:-bottom-24 sm:-left-24 lg:-bottom-32 lg:-left-32 w-44 h-44 sm:w-64 sm:h-64 lg:w-[24rem] lg:h-[24rem] rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-tech-float-delayed pointer-events-none transform-gpu"
                        style={{
                            background:
                                glowColor === 'amber'
                                    ? 'radial-gradient(circle, rgba(217, 119, 6, 0.10) 0%, transparent 70%)'
                                    : glowColor === 'cyan'
                                    ? 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)'
                                    : glowColor === 'blue'
                                    ? 'radial-gradient(circle, rgba(30, 58, 138, 0.12) 0%, transparent 70%)'
                                    : 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
                        }}
                    />

                    {/* Subtle Center Light Pod */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-48 sm:h-72 lg:h-[460px] blur-xl sm:blur-2xl lg:blur-3xl opacity-30 pointer-events-none transform-gpu"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, rgba(248, 250, 252, 0.85) 0%, transparent 75%)',
                        }}
                    />
                </div>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 1: TILES & PORCELAIN (Gạch Men, Đá Porcelain, Marble & Mosaic)   */}
            {/* ========================================================================= */}
            {canonicalVariant === 'tiles-porcelain' && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Base Tile Grid Pattern */}
                    <svg
                        className="absolute inset-0 w-full h-full opacity-75"
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                    >
                        <defs>
                            <pattern
                                id={`tile-grid-${id}`}
                                width="140"
                                height="140"
                                patternUnits="userSpaceOnUse"
                            >
                                <rect
                                    x="0"
                                    y="0"
                                    width="140"
                                    height="140"
                                    fill="none"
                                    stroke="rgba(203, 213, 225, 0.32)"
                                    strokeWidth="1"
                                />
                                <path
                                    d="M 70 0 L 70 140 M 0 70 L 140 70"
                                    fill="none"
                                    stroke="rgba(226, 232, 240, 0.4)"
                                    strokeWidth="0.8"
                                    strokeDasharray="4 4"
                                />
                                <path
                                    d="M 65 70 L 75 70 M 70 65 L 70 75"
                                    fill="none"
                                    stroke="rgba(217, 119, 6, 0.38)"
                                    strokeWidth="1.2"
                                />
                                <circle cx="70" cy="70" r="1.5" fill="#f59e0b" opacity="0.6" />
                            </pattern>

                            <linearGradient id={`marble-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#d97706" stopOpacity="0.08" />
                                <stop offset="50%" stopColor="#d97706" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.10" />
                            </linearGradient>

                            <linearGradient id={`tile-sheen-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                                <stop offset="45%" stopColor="#fef3c7" stopOpacity="0.22" />
                                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
                                <stop offset="55%" stopColor="#fef3c7" stopOpacity="0.22" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        <rect width="100%" height="100%" fill={`url(#tile-grid-${id})`} />

                        {/* Flowing Organic Calacatta Marble Veins */}
                        <g className="animate-marble-vein-drift" stroke={`url(#marble-grad-${id})`} fill="none" strokeWidth="1.4">
                            <path
                                d="M -100 120 Q 350 40, 750 180 T 1600 110"
                                strokeDasharray="14 10"
                                className="animate-tech-dash-flow"
                            />
                            <path
                                d="M -50 380 Q 450 480, 920 310 T 1650 390"
                                strokeDasharray="20 12"
                                className="animate-tech-dash-flow"
                            />
                        </g>

                        {/* Showroom Polished Glaze Sheen Beam */}
                        <rect
                            x="-20%"
                            y="-20%"
                            width="140%"
                            height="140%"
                            fill={`url(#tile-sheen-grad-${id})`}
                            className="animate-tile-sheen pointer-events-none"
                        />
                    </svg>

                    {/* Responsive Mosaic Diamonds (Always in viewport on mobile & desktop) */}
                    <div className="absolute top-6 left-5 sm:top-12 sm:left-14 pointer-events-none transform-gpu">
                        <svg viewBox="0 0 30 40" className="w-5 h-6 sm:w-7 sm:h-9 animate-cooling-ion-bob" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(217, 119, 6, 0.35)" strokeWidth="1.2">
                            <polygon points="15,2 28,20 15,38 2,20" />
                        </svg>
                    </div>
                    <div className="absolute top-8 right-5 sm:top-14 sm:right-16 pointer-events-none transform-gpu">
                        <svg viewBox="0 0 30 40" className="w-5 h-6 sm:w-7 sm:h-9 animate-cooling-ion-bob-delayed" fill="rgba(14, 165, 233, 0.08)" stroke="rgba(14, 165, 233, 0.35)" strokeWidth="1.2">
                            <polygon points="15,2 28,20 15,38 2,20" />
                        </svg>
                    </div>
                    <div className="absolute bottom-8 left-6 sm:bottom-14 sm:left-20 pointer-events-none transform-gpu">
                        <svg viewBox="0 0 30 40" className="w-4 h-5 sm:w-6 sm:h-8 animate-cooling-ion-bob" fill="rgba(245, 158, 11, 0.06)" stroke="rgba(217, 119, 6, 0.3)" strokeWidth="1.2">
                            <polygon points="15,2 28,20 15,38 2,20" />
                        </svg>
                    </div>
                    <div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-24 pointer-events-none transform-gpu">
                        <svg viewBox="0 0 30 40" className="w-5 h-6 sm:w-7 sm:h-9 animate-cooling-ion-bob-delayed" fill="rgba(245, 158, 11, 0.07)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.2">
                            <polygon points="15,2 28,20 15,38 2,20" />
                        </svg>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 2: HVAC & WATER CHILLER (Điều Hòa Trung Tâm VRV, Chiller & Gió Mát) */}
            {/* ========================================================================= */}
            {canonicalVariant === 'hvac-chiller' && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Aerodynamic Airflow Waves & Refrigerant Piping Base */}
                    <svg
                        className="absolute inset-0 w-full h-full opacity-70"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 600"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id={`hvac-flow-1-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
                                <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.30" />
                                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.06" />
                            </linearGradient>

                            <linearGradient id={`hvac-flow-2-${id}`} x1="100%" y1="0%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.10" />
                                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.28" />
                                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.08" />
                            </linearGradient>

                            <linearGradient id={`pipe-grad-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.22" />
                                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.22" />
                            </linearGradient>
                        </defs>

                        {/* Aerodynamic Chilled Airflow Wave Paths */}
                        <g fill="none" strokeWidth="1.8">
                            <path
                                d="M -80 160 C 280 60, 720 280, 1520 120"
                                stroke={`url(#hvac-flow-1-${id})`}
                                strokeDasharray="24 12"
                                className="animate-hvac-air-stream"
                            />
                            <path
                                d="M -80 300 C 380 440, 860 180, 1520 320"
                                stroke={`url(#hvac-flow-2-${id})`}
                                strokeDasharray="28 14"
                                className="animate-hvac-air-stream"
                            />
                            <path
                                d="M -80 460 C 320 520, 920 360, 1520 500"
                                stroke={`url(#hvac-flow-1-${id})`}
                                strokeDasharray="20 10"
                                className="animate-hvac-air-stream"
                            />
                        </g>

                        {/* Refrigerant Closed Loop Piping Lines */}
                        <g stroke={`url(#pipe-grad-${id})`} fill="none" strokeWidth="1.2" strokeDasharray="6 6" className="animate-tech-dash-flow">
                            <path d="M 120 40 H 420 L 460 80 H 760" />
                            <path d="M 1320 560 H 980 L 940 520 H 680" />
                        </g>
                    </svg>

                    {/* Primary VRV Condenser Fan (Top Right - Isolated Hardware Compositor Layer) */}
                    <div className="absolute top-3 right-3 sm:top-6 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-44 lg:h-44 pointer-events-none opacity-30 sm:opacity-40 transform-gpu contain-paint">
                        <svg viewBox="-100 -100 200 200" className="w-full h-full animate-hvac-fan-spin">
                            <circle cx="0" cy="0" r="90" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="8 6" />
                            <circle cx="0" cy="0" r="45" fill="none" stroke="#0284c7" strokeWidth="1.2" />
                            <circle cx="0" cy="0" r="12" fill="#0284c7" opacity="0.6" />
                            <path d="M -70 0 C -40 -25, -15 -10, 0 0 C -15 10, -40 25, -70 0 Z" fill="#38bdf8" opacity="0.4" />
                            <path d="M 70 0 C 40 25, 15 10, 0 0 C 15 -10, 40 -25, 70 0 Z" fill="#38bdf8" opacity="0.4" />
                            <path d="M 0 -70 C 25 -40, 10 -15, 0 0 C -10 -15, -25 -40, 0 -70 Z" fill="#38bdf8" opacity="0.4" />
                            <path d="M 0 70 C -25 40, -10 15, 0 0 C 10 15, 25 40, 0 70 Z" fill="#38bdf8" opacity="0.4" />
                        </svg>
                    </div>

                    {/* Secondary Condenser Fan (Bottom Left - Isolated Hardware Compositor Layer) */}
                    <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-8 w-18 h-18 sm:w-24 sm:h-24 lg:w-32 lg:h-32 pointer-events-none opacity-25 sm:opacity-35 transform-gpu contain-paint">
                        <svg viewBox="-80 -80 160 160" className="w-full h-full animate-hvac-fan-spin">
                            <circle cx="0" cy="0" r="75" fill="none" stroke="#d97706" strokeWidth="1.2" strokeDasharray="6 6" />
                            <circle cx="0" cy="0" r="10" fill="#d97706" opacity="0.5" />
                            <path d="M -60 0 C -30 -20, -10 -8, 0 0 C -10 8, -30 20, -60 0 Z" fill="#fbbf24" opacity="0.35" />
                            <path d="M 60 0 C 30 20, 10 8, 0 0 C 10 -8, 30 -20, 60 0 Z" fill="#fbbf24" opacity="0.35" />
                            <path d="M 0 -60 C 20 -30, 8 -10, 0 0 C -8 -10, -20 -30, 0 -60 Z" fill="#fbbf24" opacity="0.35" />
                            <path d="M 0 60 C -20 30, -8 10, 0 0 C 8 10, 20 30, 0 60 Z" fill="#fbbf24" opacity="0.35" />
                        </svg>
                    </div>

                    {/* Floating Cooling Air Ions & Plasmaster Purification Particles */}
                    <div className="absolute top-[22%] left-[16%] sm:left-[22%] pointer-events-none transform-gpu">
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-cooling-ion-bob fill-sky-400">
                            <polygon points="8,0 15,4 15,12 8,16 1,12 1,4" />
                        </svg>
                    </div>
                    <div className="absolute top-[18%] left-[50%] -translate-x-1/2 pointer-events-none transform-gpu">
                        <svg viewBox="0 0 20 20" className="w-4 h-4 sm:w-5 sm:h-5 animate-cooling-ion-bob-delayed fill-sky-500">
                            <path d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z" />
                        </svg>
                    </div>
                    <div className="absolute top-[42%] right-[15%] sm:right-[22%] pointer-events-none transform-gpu">
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-cooling-ion-bob fill-sky-400">
                            <polygon points="8,0 15,4 15,12 8,16 1,12 1,4" />
                        </svg>
                    </div>
                    <div className="absolute bottom-[24%] left-[28%] pointer-events-none transform-gpu">
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-cooling-ion-bob fill-sky-500">
                            <polygon points="8,0 15,4 15,12 8,16 1,12 1,4" />
                        </svg>
                    </div>
                    <div className="absolute bottom-[20%] right-[12%] sm:right-[18%] pointer-events-none transform-gpu">
                        <svg viewBox="0 0 20 20" className="w-4 h-4 sm:w-5 sm:h-5 animate-cooling-ion-bob-delayed fill-amber-500">
                            <path d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 3: INDUSTRIAL EQUIPMENT (Cơ Điện, Van Công Nghiệp, Chiller Trục Vít) */}
            {/* ========================================================================= */}
            {canonicalVariant === 'industrial-equipment' && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Hexagon Mesh Base */}
                    <svg
                        className="absolute inset-0 w-full h-full opacity-70"
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                    >
                        <defs>
                            <pattern
                                id={`hex-mesh-${id}`}
                                width="64"
                                height="110.8"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M32,0 L64,18.5 L64,55.4 L32,73.9 L0,55.4 L0,18.5 Z M32,110.8 L64,92.3 L64,55.4 L32,73.9 L0,55.4 L0,92.3 Z"
                                    fill="none"
                                    stroke="rgba(148, 163, 184, 0.16)"
                                    strokeWidth="0.9"
                                />
                                <circle cx="32" cy="55.4" r="2.2" fill="rgba(245, 158, 11, 0.32)" />
                            </pattern>
                        </defs>

                        <rect width="100%" height="100%" fill={`url(#hex-mesh-${id})`} />

                        {/* Precision Dimension Calibration Lines */}
                        <g stroke="rgba(217, 119, 6, 0.28)" strokeWidth="1.2" fill="none">
                            <line x1="-5%" y1="35%" x2="105%" y2="45%" strokeDasharray="16 10" className="animate-tech-dash-flow" />
                            <line x1="-5%" y1="75%" x2="105%" y2="85%" strokeDasharray="22 12" className="animate-tech-dash-flow" />
                        </g>
                    </svg>

                    {/* Industrial Butterfly Valve & Flange CAD Line Art (Responsive Top Right) */}
                    <div className="absolute top-3 right-3 sm:top-6 sm:right-10 w-28 h-28 sm:w-36 sm:h-36 lg:w-52 lg:h-52 pointer-events-none opacity-30 sm:opacity-40 transform-gpu contain-paint">
                        <svg viewBox="-125 -125 250 250" className="w-full h-full stroke-sky-500 fill-none" strokeWidth="1.2">
                            <circle cx="0" cy="0" r="110" strokeDasharray="8 6" />
                            <circle cx="0" cy="0" r="90" />
                            <circle cx="0" cy="0" r="50" stroke="#d97706" strokeWidth="1.5" opacity="0.7" />
                            <line x1="-120" y1="0" x2="120" y2="0" strokeWidth="1.6" />
                            <line x1="0" y1="-120" x2="0" y2="120" strokeWidth="1.2" strokeDasharray="4 4" />
                            <circle cx="75" cy="0" r="4" fill="rgba(14, 165, 233, 0.45)" />
                            <circle cx="-75" cy="0" r="4" fill="rgba(14, 165, 233, 0.45)" />
                            <circle cx="0" cy="75" r="4" fill="rgba(14, 165, 233, 0.45)" />
                            <circle cx="0" cy="-75" r="4" fill="rgba(14, 165, 233, 0.45)" />
                            <circle cx="53" cy="53" r="3.5" fill="rgba(217, 119, 6, 0.45)" />
                            <circle cx="-53" cy="-53" r="3.5" fill="rgba(217, 119, 6, 0.45)" />
                            <circle cx="-53" cy="53" r="3.5" fill="rgba(217, 119, 6, 0.45)" />
                            <circle cx="53" cy="-53" r="3.5" fill="rgba(217, 119, 6, 0.45)" />
                        </svg>
                    </div>

                    {/* Technical Specification Annotations from DB */}
                    <div className="absolute left-3 top-3 sm:left-8 sm:top-8 font-mono text-[9px] sm:text-[11px] text-slate-400/70 leading-relaxed font-semibold tracking-wider pointer-events-none select-none">
                        <div>SPEC // DN50 - DN800 | PN16/25</div>
                        <div>CTRL // RS-485 MODBUS RTU | IP68</div>
                        <div className="hidden sm:block">HVAC // COP 3.8 ~ 4.2 | R410A</div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 4: SMART WORKFLOW (Quy Trình 5 Bước Cơ Điện & Cung Ứng Dự Án)     */}
            {/* ========================================================================= */}
            {canonicalVariant === 'smart-workflow' && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <svg
                        className="absolute inset-0 w-full h-full opacity-75"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 500"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            <linearGradient id={`workflow-trace-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#d97706" stopOpacity="0.28" />
                                <stop offset="35%" stopColor="#0284c7" stopOpacity="0.32" />
                                <stop offset="70%" stopColor="#d97706" stopOpacity="0.32" />
                                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.28" />
                            </linearGradient>
                        </defs>

                        {/* Interconnected Circuit Pipeline Linking Step 1 -> Step 5 */}
                        <g stroke={`url(#workflow-trace-grad-${id})`} fill="none" strokeWidth="1.6">
                            <path
                                d="M 60 140 H 280 L 330 190 H 590 L 640 140 H 890 L 940 190 H 1190 L 1240 140 H 1420"
                                strokeDasharray="10 8"
                                className="animate-tech-dash-flow"
                            />
                            <path
                                d="M 60 360 H 260 L 310 310 H 570 L 620 360 H 870 L 920 310 H 1170 L 1220 360 H 1420"
                                strokeDasharray="12 8"
                                className="animate-tech-dash-flow"
                            />
                        </g>

                        {/* Checkpoint Nodes linking 5 stages */}
                        <g fill="#0284c7">
                            <circle cx="280" cy="140" r="5" fill="#d97706" />
                            <circle cx="280" cy="140" r="10" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                            <circle cx="590" cy="190" r="5" fill="#0284c7" />
                            <circle cx="590" cy="190" r="10" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
                            <circle cx="890" cy="140" r="5.5" fill="#d97706" />
                            <circle cx="890" cy="140" r="11" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                            <circle cx="1190" cy="190" r="5" fill="#0284c7" />
                            <circle cx="1190" cy="190" r="10" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
                        </g>
                    </svg>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 5: PARTNER NETWORK (Mạng Lưới Đối Tác Chiến Lược Cấp 1)           */}
            {/* ========================================================================= */}
            {canonicalVariant === 'partner-network' && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <svg
                        className="absolute inset-0 w-full h-full opacity-70"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 400"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        {/* Interconnecting Supply Constellations */}
                        <g stroke="rgba(14, 165, 233, 0.25)" strokeWidth="1.2" fill="none">
                            <line x1="140" y1="140" x2="360" y2="80" />
                            <line x1="360" y1="80" x2="540" y2="180" />
                            <line x1="540" y1="180" x2="800" y2="120" />
                            <line x1="800" y1="120" x2="1040" y2="210" />

                            <line x1="220" y1="320" x2="460" y2="260" />
                            <line x1="460" y1="260" x2="740" y2="340" />
                            <line x1="740" y1="340" x2="1000" y2="280" />

                            <line x1="360" y1="80" x2="460" y2="260" strokeDasharray="4 4" stroke="rgba(217, 119, 6, 0.2)" />
                            <line x1="800" y1="120" x2="740" y2="340" strokeDasharray="4 4" stroke="rgba(217, 119, 6, 0.2)" />
                        </g>

                        {/* Brand Satellite Nodes */}
                        <g fill="#0284c7">
                            <circle cx="140" cy="140" r="5" fill="#d97706" />
                            <circle cx="360" cy="80" r="4.5" />
                            <circle cx="540" cy="180" r="6" fill="#d97706" />
                            <circle cx="800" cy="120" r="5" />
                            <circle cx="1040" cy="210" r="5.5" fill="#d97706" />
                        </g>
                        <g fill="#d97706">
                            <circle cx="220" cy="320" r="4.5" />
                            <circle cx="460" cy="260" r="5" fill="#0284c7" />
                            <circle cx="740" cy="340" r="6" />
                            <circle cx="1000" cy="280" r="4.5" fill="#0284c7" />
                        </g>
                    </svg>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 6: ECOMMERCE PORTAL (Cổng Giao Dịch Báo Giá, Banner & Danh Mục)     */}
            {/* ========================================================================= */}
            {canonicalVariant === 'ecommerce-portal' && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Base Dot Matrix Pattern */}
                    <svg
                        className="absolute inset-0 w-full h-full opacity-70"
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                    >
                        <defs>
                            <pattern
                                id={`dot-matrix-${id}`}
                                width="36"
                                height="36"
                                patternUnits="userSpaceOnUse"
                            >
                                <circle cx="18" cy="18" r="1.3" fill="rgba(148, 163, 184, 0.35)" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#dot-matrix-${id})`} />
                    </svg>

                    {/* HUD Precision Corner Alignment Brackets (Anchored to 4 Corners on ANY Screen) */}
                    <div className="absolute top-2.5 left-2.5 sm:top-5 sm:left-5 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-l-2 border-amber-500/40 pointer-events-none" />
                    <div className="absolute top-2.5 right-2.5 sm:top-5 sm:right-5 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-r-2 border-amber-500/40 pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 sm:bottom-5 sm:left-5 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-l-2 border-amber-500/40 pointer-events-none" />
                    <div className="absolute bottom-2.5 right-2.5 sm:bottom-5 sm:right-5 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-r-2 border-amber-500/40 pointer-events-none" />

                    {/* Midpoint Coordinate Crosshairs */}
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 hidden sm:flex items-center gap-1 text-sky-500/40 text-xs font-mono select-none">
                        <span>+</span><span className="text-[10px]">SYS.01</span>
                    </div>
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 hidden sm:flex items-center gap-1 text-sky-500/40 text-xs font-mono select-none">
                        <span className="text-[10px]">SYS.02</span><span>+</span>
                    </div>
                </div>
            )}

            {/* Optional Content Container */}
            {children && <div className="relative z-10 pointer-events-auto">{children}</div>}
        </div>
    );
}
