/**
 * UNIFIED MASTER SEED SCRIPT FOR SAIGONVALVE / DONG DUONG CORP
 * Runs all seed scripts sequentially to populate a complete database:
 * 1. Admin, Roles & RBAC (Admin, Superadmin from .env)
 * 2. Master catalog (Categories, Products, Slides, Brand Partners, News, Projects)
 * 3. Solutions (HVAC VRV/Chiller, Big Slab Tiles, Commercial AC)
 * 4. Recruitment & Jobs
 * 5. Trilingual Settings & Chinese Localization
 */

const { execSync } = require('child_process');
const path = require('path');

const scripts = [
    { name: '1. Admin & RBAC (Roles, Permissions, Users)', file: 'seed_admin_rbac.js' },
    { name: '2. Dong Duong Master Data (Categories, Products, Projects, News)', file: 'seed_dongduong_master.js' },
    { name: '3. HVAC & Tile Solutions', file: 'seed_solutions.js' },
    { name: '4. Recruitment & Job Openings', file: 'seed_jobs.js' },
    { name: '5. Trilingual System Settings', file: 'seed_trilingual_settings.js' },
    { name: '6. Chinese Localization', file: 'seed_chinese_localization.js' },
];

console.log('================================================================');
console.log('🚀 STARTING COMPLETE DATABASE SEEDING FOR SAIGONVALVE / DONG DUONG');
console.log('================================================================\n');

for (const step of scripts) {
    const scriptPath = path.join(__dirname, step.file);
    console.log(`\n▶️  [RUNNING] ${step.name}...`);
    try {
        execSync(`node "${scriptPath}"`, {
            stdio: 'inherit',
            env: process.env,
        });
        console.log(`✅ [COMPLETED] ${step.name}`);
    } catch (err) {
        console.error(`❌ [FAILED] ${step.name}:`, err.message);
        process.exit(1);
    }
}

console.log('\n================================================================');
console.log('🎉 ALL DATABASE SEEDING COMPLETED SUCCESSFULLY!');
console.log('================================================================\n');
