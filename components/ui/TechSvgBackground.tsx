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
        >
            {/* 1. Ambient Dynamic Lighting Orbs */}
            {showOrbs && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {/* Top Right Ambient Glow */}
                    <div
                        className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl animate-tech-pulse-glow pointer-events-none"
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
                        className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full blur-3xl animate-tech-float-delayed pointer-events-none"
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
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] blur-3xl opacity-30 pointer-events-none"
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
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-80"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                >
                    <defs>
                        {/* 1. Large 60x120 & 80x80 Tile Grid Pattern with Grout Lines */}
                        <pattern
                            id={`tile-grid-${id}`}
                            width="160"
                            height="160"
                            patternUnits="userSpaceOnUse"
                        >
                            {/* Outer Tile Boundary Grout */}
                            <rect
                                x="0"
                                y="0"
                                width="160"
                                height="160"
                                fill="none"
                                stroke="rgba(203, 213, 225, 0.35)"
                                strokeWidth="1"
                            />
                            {/* Inner Sub-Tile Division (Subtle 80x80 division) */}
                            <path
                                d="M 80 0 L 80 160 M 0 80 L 160 80"
                                fill="none"
                                stroke="rgba(226, 232, 240, 0.45)"
                                strokeWidth="0.8"
                                strokeDasharray="4 4"
                            />
                            {/* Golden Grout Crosshairs at tile intersections */}
                            <path
                                d="M 74 80 L 86 80 M 80 74 L 80 86"
                                fill="none"
                                stroke="rgba(217, 119, 6, 0.4)"
                                strokeWidth="1.4"
                            />
                            <circle cx="80" cy="80" r="1.5" fill="#f59e0b" opacity="0.6" />
                        </pattern>

                        {/* 2. Showroom Light Reflection Gradient */}
                        <linearGradient id={`tile-sheen-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                            <stop offset="45%" stopColor="#fef3c7" stopOpacity="0.25" />
                            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
                            <stop offset="55%" stopColor="#fef3c7" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>

                        {/* 3. Calacatta Natural Marble Vein Gradient */}
                        <linearGradient id={`marble-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#d97706" stopOpacity="0.10" />
                            <stop offset="50%" stopColor="#d97706" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.12" />
                        </linearGradient>
                    </defs>

                    {/* Background Isometric & Orthogonal Architectural Tile Floor */}
                    <rect width="100%" height="100%" fill={`url(#tile-grid-${id})`} />

                    {/* Flowing Organic Calacatta Marble Veins (Vân đá tự nhiên mềm mại) */}
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

                    {/* Geometric Mosaic Diamond Art Elements (Mosaic hồ bơi & resort) */}
                    <g fill="none" stroke="rgba(217, 119, 6, 0.3)" strokeWidth="1.2">
                        {/* Diamond 1 */}
                        <polygon
                            points="120,70 135,50 150,70 135,90"
                            className="animate-cooling-ion-bob"
                            fill="rgba(245, 158, 11, 0.08)"
                        />
                        {/* Diamond 2 */}
                        <polygon
                            points="1320,110 1338,90 1356,110 1338,130"
                            className="animate-cooling-ion-bob-delayed"
                            fill="rgba(14, 165, 233, 0.08)"
                        />
                        {/* Diamond 3 */}
                        <polygon
                            points="260,460 275,440 290,460 275,480"
                            className="animate-cooling-ion-bob"
                            fill="rgba(245, 158, 11, 0.06)"
                        />
                        {/* Diamond 4 */}
                        <polygon
                            points="1180,480 1198,460 1216,480 1198,500"
                            className="animate-cooling-ion-bob-delayed"
                            fill="rgba(245, 158, 11, 0.07)"
                        />
                    </g>

                    {/* Showroom Polished Glaze Sheen Beam (Vệt sáng bóng kiếng Nano lướt qua) */}
                    <rect
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                        fill={`url(#tile-sheen-grad-${id})`}
                        className="animate-tile-sheen pointer-events-none"
                    />
                </svg>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 2: HVAC & WATER CHILLER (Điều Hòa Trung Tâm VRV, Chiller & Gió Mát) */}
            {/* ========================================================================= */}
            {canonicalVariant === 'hvac-chiller' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-75"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 640"
                    preserveAspectRatio="none"
                >
                    <defs>
                        {/* Airflow Streamline Gradients */}
                        <linearGradient id={`hvac-flow-1-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.10" />
                            <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.32" />
                            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.08" />
                        </linearGradient>

                        <linearGradient id={`hvac-flow-2-${id}`} x1="100%" y1="0%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12" />
                            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.30" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.10" />
                        </linearGradient>

                        {/* Refrigerant R410A / R32 Piping Loop Gradient */}
                        <linearGradient id={`pipe-grad-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.25" />
                        </linearGradient>
                    </defs>

                    {/* Central VRV Condenser Fan Vector (Cánh quạt tản nhiệt dàn nóng quay êm) */}
                    <g
                        transform="translate(1360, 100)"
                        className="animate-hvac-fan-spin opacity-35 pointer-events-none"
                    >
                        <circle cx="0" cy="0" r="90" fill="none" stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="8 6" />
                        <circle cx="0" cy="0" r="45" fill="none" stroke="#0284c7" strokeWidth="1" />
                        <circle cx="0" cy="0" r="12" fill="#0284c7" opacity="0.6" />
                        {/* 4 Fan Blades */}
                        <path d="M -70 0 C -40 -25, -15 -10, 0 0 C -15 10, -40 25, -70 0 Z" fill="#38bdf8" opacity="0.4" />
                        <path d="M 70 0 C 40 25, 15 10, 0 0 C 15 -10, 40 -25, 70 0 Z" fill="#38bdf8" opacity="0.4" />
                        <path d="M 0 -70 C 25 -40, 10 -15, 0 0 C -10 -15, -25 -40, 0 -70 Z" fill="#38bdf8" opacity="0.4" />
                        <path d="M 0 70 C -25 40, -10 15, 0 0 C 10 15, 25 40, 0 70 Z" fill="#38bdf8" opacity="0.4" />
                    </g>

                    {/* Secondary Condenser Fan (Góc dưới bên trái) */}
                    <g
                        transform="translate(70, 520)"
                        className="animate-hvac-fan-spin opacity-30 pointer-events-none"
                    >
                        <circle cx="0" cy="0" r="75" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="6 6" />
                        <circle cx="0" cy="0" r="10" fill="#d97706" opacity="0.5" />
                        <path d="M -60 0 C -30 -20, -10 -8, 0 0 C -10 8, -30 20, -60 0 Z" fill="#fbbf24" opacity="0.35" />
                        <path d="M 60 0 C 30 20, 10 8, 0 0 C 10 -8, 30 -20, 60 0 Z" fill="#fbbf24" opacity="0.35" />
                        <path d="M 0 -60 C 20 -30, 8 -10, 0 0 C -8 -10, -20 -30, 0 -60 Z" fill="#fbbf24" opacity="0.35" />
                        <path d="M 0 60 C -20 30, -8 10, 0 0 C 8 10, 20 30, 0 60 Z" fill="#fbbf24" opacity="0.35" />
                    </g>

                    {/* Aerodynamic Chilled Airflow Wave Paths (Luồng khí lạnh VRV / Chiller lướt qua) */}
                    <g fill="none" strokeWidth="1.8">
                        <path
                            d="M -80 160 C 280 60, 720 280, 1520 120"
                            stroke={`url(#hvac-flow-1-${id})`}
                            strokeDasharray="24 12"
                            className="animate-hvac-air-stream"
                        />
                        <path
                            d="M -80 280 C 380 420, 860 160, 1520 300"
                            stroke={`url(#hvac-flow-2-${id})`}
                            strokeDasharray="28 14"
                            className="animate-hvac-air-stream"
                        />
                        <path
                            d="M -80 440 C 320 500, 920 340, 1520 480"
                            stroke={`url(#hvac-flow-1-${id})`}
                            strokeDasharray="20 10"
                            className="animate-hvac-air-stream"
                        />
                    </g>

                    {/* Refrigerant Closed Loop Piping Lines (Đường ống đồng môi chất lạnh) */}
                    <g stroke={`url(#pipe-grad-${id})`} fill="none" strokeWidth="1.2" strokeDasharray="6 6" className="animate-tech-dash-flow">
                        <path d="M 120 40 H 420 L 460 80 H 760" />
                        <path d="M 1320 580 H 980 L 940 540 H 680" />
                    </g>

                    {/* Floating Cooling Air Ions & Plasmaster Purification Particles (Hạt ion làm sạch không khí) */}
                    <g fill="#0284c7" opacity="0.7">
                        {/* Hexagonal Frost Ion 1 */}
                        <polygon
                            points="320,110 326,114 326,122 320,126 314,122 314,114"
                            className="animate-cooling-ion-bob"
                            fill="#38bdf8"
                        />
                        {/* Star Ion 2 */}
                        <path
                            d="M 640 180 Q 640 188 648 188 Q 640 188 640 196 Q 640 188 632 188 Q 640 188 640 180 Z"
                            className="animate-cooling-ion-bob-delayed"
                            fill="#0ea5e9"
                        />
                        {/* Hexagonal Frost Ion 3 */}
                        <polygon
                            points="960,250 967,255 967,263 960,268 953,263 953,255"
                            className="animate-cooling-ion-bob"
                            fill="#38bdf8"
                        />
                        {/* Star Ion 4 */}
                        <path
                            d="M 1180 340 Q 1180 349 1189 349 Q 1180 349 1180 358 Q 1180 349 1171 349 Q 1180 349 1180 340 Z"
                            className="animate-cooling-ion-bob-delayed"
                            fill="#f59e0b"
                        />
                        {/* Hexagonal Frost Ion 5 */}
                        <polygon
                            points="480,480 486,484 486,492 480,496 474,492 474,484"
                            className="animate-cooling-ion-bob"
                            fill="#0ea5e9"
                        />
                    </g>
                </svg>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 3: INDUSTRIAL EQUIPMENT (Cơ Điện, Van Công Nghiệp, Chiller Trục Vít) */}
            {/* ========================================================================= */}
            {canonicalVariant === 'industrial-equipment' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-75"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                >
                    <defs>
                        {/* Heavy Equipment Hexagon Honeycomb Mesh Pattern */}
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
                            {/* Pressure Node Indicator */}
                            <circle cx="32" cy="55.4" r="2.2" fill="rgba(245, 158, 11, 0.35)" />
                        </pattern>
                    </defs>

                    {/* Hexagon Mesh Base */}
                    <rect width="100%" height="100%" fill={`url(#hex-mesh-${id})`} />

                    {/* Industrial Butterfly Valve & Flange CAD Line Art (Góc phải trên) */}
                    <g transform="translate(1320, 80)" stroke="rgba(14, 165, 233, 0.28)" fill="none" strokeWidth="1.2">
                        {/* Outer Flange Circle */}
                        <circle cx="0" cy="0" r="110" strokeDasharray="8 6" />
                        <circle cx="0" cy="0" r="90" />
                        <circle cx="0" cy="0" r="50" stroke="#d97706" strokeWidth="1.4" opacity="0.6" />
                        {/* Valve Stem & Disk axis */}
                        <line x1="-120" y1="0" x2="120" y2="0" strokeWidth="1.6" />
                        <line x1="0" y1="-120" x2="0" y2="120" strokeWidth="1.2" strokeDasharray="4 4" />
                        {/* Bolt Holes */}
                        <circle cx="75" cy="0" r="4" fill="rgba(14, 165, 233, 0.35)" />
                        <circle cx="-75" cy="0" r="4" fill="rgba(14, 165, 233, 0.35)" />
                        <circle cx="0" cy="75" r="4" fill="rgba(14, 165, 233, 0.35)" />
                        <circle cx="0" cy="-75" r="4" fill="rgba(14, 165, 233, 0.35)" />
                        <circle cx="53" cy="53" r="3.5" fill="rgba(217, 119, 6, 0.35)" />
                        <circle cx="-53" cy="-53" r="3.5" fill="rgba(217, 119, 6, 0.35)" />
                        <circle cx="-53" cy="53" r="3.5" fill="rgba(217, 119, 6, 0.35)" />
                        <circle cx="53" cy="-53" r="3.5" fill="rgba(217, 119, 6, 0.35)" />
                    </g>

                    {/* Technical Specification Annotations from DB (DN50 - DN800, PN16, IP68, Modbus) */}
                    <g fill="rgba(100, 116, 139, 0.45)" fontSize="11" fontFamily="monospace" fontWeight="600">
                        <text x="40" y="60">SPEC // DN50 - DN800 | PN16/25</text>
                        <text x="40" y="80">CTRL // RS-485 MODBUS RTU | IP68</text>
                        <text x="40" y="100">HVAC // COP 3.8 ~ 4.2 | R410A</text>
                    </g>

                    {/* Precision Dimension Calibration Lines */}
                    <g stroke="rgba(217, 119, 6, 0.28)" strokeWidth="1.2" fill="none">
                        <line x1="-5%" y1="30%" x2="105%" y2="45%" strokeDasharray="16 10" className="animate-tech-dash-flow" />
                        <line x1="-5%" y1="75%" x2="105%" y2="85%" strokeDasharray="22 12" className="animate-tech-dash-flow" />
                    </g>
                </svg>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 4: SMART WORKFLOW (Quy Trình 5 Bước Cơ Điện & Cung Ứng Dự Án)     */}
            {/* ========================================================================= */}
            {canonicalVariant === 'smart-workflow' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-80"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 600"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id={`workflow-trace-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#d97706" stopOpacity="0.30" />
                            <stop offset="35%" stopColor="#0284c7" stopOpacity="0.35" />
                            <stop offset="70%" stopColor="#d97706" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.30" />
                        </linearGradient>
                    </defs>

                    {/* Interconnected Circuit Pipeline Linking Step 1 -> Step 5 */}
                    <g stroke={`url(#workflow-trace-grad-${id})`} fill="none" strokeWidth="1.6">
                        {/* Upper Pathway */}
                        <path
                            d="M 60 140 H 280 L 330 190 H 590 L 640 140 H 890 L 940 190 H 1190 L 1240 140 H 1420"
                            strokeDasharray="10 8"
                            className="animate-tech-dash-flow"
                        />
                        {/* Lower Complementary Pipeline */}
                        <path
                            d="M 60 460 H 260 L 310 410 H 570 L 620 460 H 870 L 920 410 H 1170 L 1220 460 H 1420"
                            strokeDasharray="12 8"
                            className="animate-tech-dash-flow"
                        />
                    </g>

                    {/* Checkpoint Nodes linking 5 stages */}
                    <g fill="#0284c7">
                        {/* Node 1: Tìm kiếm */}
                        <circle cx="280" cy="140" r="5" fill="#d97706" />
                        <circle cx="280" cy="140" r="10" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                        {/* Node 2: Tư vấn & Báo giá */}
                        <circle cx="590" cy="190" r="5" fill="#0284c7" />
                        <circle cx="590" cy="190" r="10" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
                        {/* Node 3: Hợp đồng */}
                        <circle cx="890" cy="140" r="5.5" fill="#d97706" />
                        <circle cx="890" cy="140" r="11" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                        {/* Node 4: Vận chuyển logistics */}
                        <circle cx="1190" cy="190" r="5" fill="#0284c7" />
                        <circle cx="1190" cy="190" r="10" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
                    </g>
                </svg>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 5: PARTNER NETWORK (Mạng Lưới Đối Tác Chiến Lược Cấp 1)           */}
            {/* ========================================================================= */}
            {canonicalVariant === 'partner-network' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-70"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 620"
                    preserveAspectRatio="none"
                >
                    {/* Interconnecting Supply Constellations */}
                    <g stroke="rgba(14, 165, 233, 0.25)" strokeWidth="1.2" fill="none">
                        {/* Line network */}
                        <line x1="140" y1="180" x2="360" y2="120" />
                        <line x1="360" y1="120" x2="540" y2="250" />
                        <line x1="540" y1="250" x2="800" y2="170" />
                        <line x1="800" y1="170" x2="1040" y2="290" />
                        <line x1="1040" y1="290" x2="1280" y2="190" />

                        <line x1="220" y1="440" x2="460" y2="380" />
                        <line x1="460" y1="380" x2="740" y2="460" />
                        <line x1="740" y1="460" x2="1000" y2="400" />
                        <line x1="1000" y1="400" x2="1340" y2="470" />

                        {/* Cross links */}
                        <line x1="360" y1="120" x2="460" y2="380" strokeDasharray="4 4" stroke="rgba(217, 119, 6, 0.2)" />
                        <line x1="800" y1="170" x2="740" y2="460" strokeDasharray="4 4" stroke="rgba(217, 119, 6, 0.2)" />
                        <line x1="1040" y1="290" x2="1000" y2="400" strokeDasharray="4 4" stroke="rgba(14, 165, 233, 0.2)" />
                    </g>

                    {/* Brand Satellite Nodes: Đồng Tâm, Viglacera, Catalan, Gree, Midea, VNSTEEL */}
                    <g fill="#0284c7">
                        <circle cx="140" cy="180" r="5" fill="#d97706" />
                        <circle cx="360" cy="120" r="4.5" />
                        <circle cx="540" cy="250" r="6" fill="#d97706" />
                        <circle cx="800" cy="170" r="5" />
                        <circle cx="1040" cy="290" r="5.5" fill="#d97706" />
                        <circle cx="1280" cy="190" r="4.5" />
                    </g>
                    <g fill="#d97706">
                        <circle cx="220" cy="440" r="4.5" />
                        <circle cx="460" cy="380" r="5" fill="#0284c7" />
                        <circle cx="740" cy="460" r="6.5" />
                        <circle cx="1000" cy="400" r="4.5" fill="#0284c7" />
                        <circle cx="1340" cy="470" r="5.5" />
                    </g>
                </svg>
            )}

            {/* ========================================================================= */}
            {/* VARIANT 6: ECOMMERCE PORTAL (Cổng Giao Dịch Báo Giá, Banner & Danh Mục)     */}
            {/* ========================================================================= */}
            {canonicalVariant === 'ecommerce-portal' && (
                <svg
                    className="absolute inset-0 w-full h-full z-0 opacity-75"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                >
                    <defs>
                        {/* Dot Matrix Pattern */}
                        <pattern
                            id={`dot-matrix-${id}`}
                            width="36"
                            height="36"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="18" cy="18" r="1.3" fill="rgba(148, 163, 184, 0.38)" />
                        </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill={`url(#dot-matrix-${id})`} />

                    {/* HUD Precision Corner Alignment Brackets */}
                    <g stroke="rgba(217, 119, 6, 0.42)" strokeWidth="1.4" fill="none">
                        {/* Top Left Bracket */}
                        <path d="M 60 70 H 40 V 90" />
                        {/* Top Right Bracket */}
                        <path d="M 1380 70 H 1400 V 90" />
                        {/* Bottom Left Bracket */}
                        <path d="M 40 450 V 470 H 60" />
                        {/* Bottom Right Bracket */}
                        <path d="M 1400 450 V 470 H 1380" />

                        {/* Midpoint Coordinate Crosshairs */}
                        <path d="M 120 280 L 140 280 M 130 270 L 130 290" stroke="rgba(14, 165, 233, 0.4)" />
                        <path d="M 1300 280 L 1320 280 M 1310 270 L 1310 290" stroke="rgba(14, 165, 233, 0.4)" />
                    </g>
                </svg>
            )}

            {/* Optional Content Container */}
            {children && <div className="relative z-10 pointer-events-auto">{children}</div>}
        </div>
    );
}
