'use client';

import * as React from 'react';

export type TechBackgroundVariant = 'blueprint' | 'honeycomb' | 'circuit' | 'ecommerce-grid' | 'network' | 'flow';
export type TechGlowColor = 'cyan' | 'amber' | 'blue' | 'mixed';

interface TechSvgBackgroundProps {
    variant?: TechBackgroundVariant;
    glowColor?: TechGlowColor;
    className?: string;
    showOrbs?: boolean;
    children?: React.ReactNode;
}

export default function TechSvgBackground({
    variant = 'blueprint',
    glowColor = 'mixed',
    className = '',
    showOrbs = true,
    children,
}: TechSvgBackgroundProps) {
    const id = React.useId().replace(/:/g, '');


    return (
        <div className={`overflow-hidden pointer-events-none select-none ${className.includes('absolute') ? '' : 'relative'} ${className}`}>
            {/* 1. Ambient Dynamic Glowing Orbs */}
            {showOrbs && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {/* Top Right Orb */}
                    <div
                        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl animate-tech-pulse-glow pointer-events-none"
                        style={{
                            background:
                                glowColor === 'amber'
                                    ? 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)'
                                    : glowColor === 'cyan'
                                    ? 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)'
                                    : glowColor === 'blue'
                                    ? 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)'
                                    : 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
                        }}
                    />

                    {/* Bottom Left Orb */}
                    <div
                        className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full blur-3xl animate-tech-float-delayed pointer-events-none"
                        style={{
                            background:
                                glowColor === 'amber'
                                    ? 'radial-gradient(circle, rgba(217, 119, 6, 0.09) 0%, transparent 70%)'
                                    : glowColor === 'cyan'
                                    ? 'radial-gradient(circle, rgba(14, 165, 233, 0.10) 0%, transparent 70%)'
                                    : glowColor === 'blue'
                                    ? 'radial-gradient(circle, rgba(30, 58, 138, 0.10) 0%, transparent 70%)'
                                    : 'radial-gradient(circle, rgba(6, 182, 212, 0.10) 0%, transparent 70%)',
                        }}
                    />

                    {/* Center Subtle Beam */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] blur-3xl opacity-40 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(241, 245, 249, 0.8) 0%, transparent 80%)',
                        }}
                    />
                </div>
            )}

            {/* 2. Variant Specific High-Tech Vector Graphics */}
            {variant === 'blueprint' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-80"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                >
                    <defs>
                        {/* Fine Grid Pattern */}
                        <pattern
                            id={`grid-${id}`}
                            width="48"
                            height="48"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 48 0 L 0 0 0 48"
                                fill="none"
                                stroke="rgba(148, 163, 184, 0.14)"
                                strokeWidth="0.8"
                            />
                            {/* Intersection Crosshairs */}
                            <path
                                d="M 46 48 L 50 48 M 48 46 L 48 50"
                                fill="none"
                                stroke="rgba(217, 119, 6, 0.35)"
                                strokeWidth="1"
                            />
                        </pattern>

                        {/* Large Block Grid */}
                        <pattern
                            id={`grid-lg-${id}`}
                            width="240"
                            height="240"
                            patternUnits="userSpaceOnUse"
                        >
                            <rect width="240" height="240" fill={`url(#grid-${id})`} />
                            <path
                                d="M 240 0 L 0 0 0 240"
                                fill="none"
                                stroke="rgba(2, 132, 199, 0.20)"
                                strokeWidth="1.2"
                            />
                            {/* Corner Tech Accents */}
                            <circle cx="240" cy="0" r="2.5" fill="#0284c7" opacity="0.4" />
                            <circle cx="0" cy="240" r="2.5" fill="#d97706" opacity="0.4" />
                        </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill={`url(#grid-lg-${id})`} />

                    {/* Animated Dynamic Streamlines */}
                    <g className="animate-tech-float">
                        <path
                            d="M -100 80 Q 300 20, 700 120 T 1500 90"
                            fill="none"
                            stroke="rgba(217, 119, 6, 0.25)"
                            strokeWidth="1.5"
                            strokeDasharray="12 8"
                            className="animate-tech-dash-flow"
                        />
                        <path
                            d="M -50 350 Q 400 420, 850 280 T 1600 320"
                            fill="none"
                            stroke="rgba(14, 165, 233, 0.22)"
                            strokeWidth="1.5"
                            strokeDasharray="16 10"
                            className="animate-tech-dash-flow"
                        />
                    </g>
                </svg>
            )}

            {variant === 'honeycomb' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-70"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                >
                    <defs>
                        {/* Hexagon Pattern */}
                        <pattern
                            id={`hex-${id}`}
                            width="56"
                            height="97"
                            patternUnits="userSpaceOnUse"
                            patternTransform="scale(1)"
                        >
                            <path
                                d="M28,0 L56,16.2 L56,48.5 L28,64.7 L0,48.5 L0,16.2 Z M28,97 L56,80.8 L56,48.5 L28,64.7 L0,48.5 L0,80.8 Z"
                                fill="none"
                                stroke="rgba(148, 163, 184, 0.15)"
                                strokeWidth="0.9"
                            />
                            {/* Honeycomb Center Pulse Node */}
                            <circle cx="28" cy="48.5" r="2" fill="rgba(245, 158, 11, 0.35)" />
                        </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill={`url(#hex-${id})`} />

                    {/* Ambient Flowing Diagonal Lines */}
                    <g className="animate-tech-float">
                        <line
                            x1="-20%"
                            y1="20%"
                            x2="120%"
                            y2="60%"
                            stroke="rgba(245, 158, 11, 0.20)"
                            strokeWidth="1.2"
                            strokeDasharray="20 12"
                            className="animate-tech-dash-flow"
                        />
                        <line
                            x1="-10%"
                            y1="70%"
                            x2="110%"
                            y2="90%"
                            stroke="rgba(14, 165, 233, 0.18)"
                            strokeWidth="1"
                            strokeDasharray="14 10"
                            className="animate-tech-dash-flow"
                        />
                    </g>
                </svg>
            )}

            {variant === 'circuit' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-75"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 600"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id={`circuit-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.20" />
                            <stop offset="100%" stopColor="#d97706" stopOpacity="0.25" />
                        </linearGradient>
                    </defs>

                    {/* Circuit Traces */}
                    <g stroke={`url(#circuit-grad-${id})`} fill="none" strokeWidth="1.2">
                        {/* Path 1 */}
                        <path
                            d="M 50 120 H 280 L 340 180 H 620 L 660 220 H 940"
                            strokeDasharray="8 6"
                            className="animate-tech-dash-flow"
                        />
                        <circle cx="280" cy="120" r="3.5" fill="#d97706" opacity="0.6" />
                        <circle cx="620" cy="180" r="3.5" fill="#0284c7" opacity="0.6" />
                        <circle cx="940" cy="220" r="4" fill="#d97706" opacity="0.7" />

                        {/* Path 2 */}
                        <path
                            d="M 1400 480 H 1120 L 1060 420 H 780 L 740 380 H 450"
                            strokeDasharray="10 8"
                            className="animate-tech-dash-flow"
                        />
                        <circle cx="1120" cy="480" r="3.5" fill="#0284c7" opacity="0.6" />
                        <circle cx="780" cy="420" r="3.5" fill="#d97706" opacity="0.6" />
                        <circle cx="450" cy="380" r="4" fill="#0284c7" opacity="0.7" />

                        {/* Path 3 Vertical Interconnects */}
                        <path
                            d="M 200 40 V 220 L 250 270 V 460"
                            strokeDasharray="6 6"
                            className="animate-tech-dash-flow"
                        />
                        <circle cx="200" cy="220" r="3" fill="#0284c7" opacity="0.5" />
                        <circle cx="250" cy="460" r="3.5" fill="#d97706" opacity="0.6" />

                        <path
                            d="M 1250 560 V 380 L 1200 330 V 120"
                            strokeDasharray="8 6"
                            className="animate-tech-dash-flow"
                        />
                        <circle cx="1250" cy="380" r="3" fill="#d97706" opacity="0.5" />
                        <circle cx="1200" cy="120" r="3.5" fill="#0284c7" opacity="0.6" />
                    </g>
                </svg>
            )}

            {variant === 'flow' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-60"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 600"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id={`flow-grad-1-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.20" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
                        </linearGradient>
                        <linearGradient id={`flow-grad-2-${id}`} x1="100%" y1="0%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.15" />
                        </linearGradient>
                    </defs>

                    {/* Smooth Aerodynamic Streamlines */}
                    <g fill="none" strokeWidth="1.6">
                        <path
                            d="M -60 180 C 320 80, 720 280, 1500 140"
                            stroke={`url(#flow-grad-1-${id})`}
                            strokeDasharray="14 8"
                            className="animate-tech-dash-flow"
                        />
                        <path
                            d="M -60 260 C 400 380, 880 180, 1500 320"
                            stroke={`url(#flow-grad-2-${id})`}
                            strokeDasharray="18 10"
                            className="animate-tech-dash-flow"
                        />
                        <path
                            d="M -60 420 C 360 480, 940 360, 1500 460"
                            stroke={`url(#flow-grad-1-${id})`}
                            strokeDasharray="12 6"
                            className="animate-tech-dash-flow"
                        />
                    </g>
                </svg>
            )}

            {variant === 'ecommerce-grid' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-70"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                >
                    <defs>
                        {/* Dot Matrix Pattern */}
                        <pattern
                            id={`dot-matrix-${id}`}
                            width="32"
                            height="32"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="16" cy="16" r="1.2" fill="rgba(148, 163, 184, 0.35)" />
                        </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill={`url(#dot-matrix-${id})`} />

                    {/* Tech Crosshair Highlights */}
                    <g stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1" fill="none">
                        <path d="M 80 60 L 100 60 M 90 50 L 90 70" />
                        <path d="M 1320 120 L 1340 120 M 1330 110 L 1330 130" />
                        <path d="M 220 480 L 240 480 M 230 470 L 230 490" />
                        <path d="M 1200 450 L 1220 450 M 1210 440 L 1210 460" />
                    </g>
                </svg>
            )}

            {variant === 'network' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-65"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 600"
                    preserveAspectRatio="none"
                >
                    <g stroke="rgba(14, 165, 233, 0.22)" strokeWidth="1" fill="none">
                        <line x1="120" y1="180" x2="340" y2="120" />
                        <line x1="340" y1="120" x2="520" y2="240" />
                        <line x1="520" y1="240" x2="780" y2="160" />
                        <line x1="780" y1="160" x2="1020" y2="280" />
                        <line x1="1020" y1="280" x2="1260" y2="190" />

                        <line x1="200" y1="420" x2="440" y2="360" />
                        <line x1="440" y1="360" x2="720" y2="440" />
                        <line x1="720" y1="440" x2="980" y2="390" />
                        <line x1="980" y1="390" x2="1320" y2="460" />
                    </g>
                    {/* Pulsing Nodes */}
                    <g fill="#0284c7" opacity="0.6">
                        <circle cx="120" cy="180" r="4" />
                        <circle cx="340" cy="120" r="3.5" />
                        <circle cx="520" cy="240" r="5" fill="#d97706" />
                        <circle cx="780" cy="160" r="4" />
                        <circle cx="1020" cy="280" r="4.5" fill="#d97706" />
                        <circle cx="1260" cy="190" r="3.5" />
                    </g>
                    <g fill="#d97706" opacity="0.6">
                        <circle cx="200" cy="420" r="3.5" />
                        <circle cx="440" cy="360" r="4" fill="#0284c7" />
                        <circle cx="720" cy="440" r="5" />
                        <circle cx="980" cy="390" r="3.5" fill="#0284c7" />
                        <circle cx="1320" cy="460" r="4.5" />
                    </g>
                </svg>
            )}

            {/* Optional Content Container */}
            {children && <div className="relative z-10 pointer-events-auto">{children}</div>}
        </div>
    );
}
