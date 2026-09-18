const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is required to seed admin & RBAC!');
    process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PERMISSIONS_LIST = [
    { code: 'dashboard.view', name: 'dashboard.view', module: 'dashboard', action: 'view' },
    { code: 'user.*', name: 'user.*', module: 'user', action: '*' },
    { code: 'user.view', name: 'user.view', module: 'user', action: 'view' },
    { code: 'user.create', name: 'user.create', module: 'user', action: 'create' },
    { code: 'user.update', name: 'user.update', module: 'user', action: 'update' },
    { code: 'user.delete', name: 'user.delete', module: 'user', action: 'delete' },
    { code: 'role.*', name: 'role.*', module: 'role', action: '*' },
    { code: 'role.view', name: 'role.view', module: 'role', action: 'view' },
    { code: 'role.create', name: 'role.create', module: 'role', action: 'create' },
    { code: 'role.update', name: 'role.update', module: 'role', action: 'update' },
    { code: 'role.delete', name: 'role.delete', module: 'role', action: 'delete' },
    { code: 'role.assign_permission', name: 'role.assign_permission', module: 'role', action: 'assign_permission' },
    { code: 'news.*', name: 'news.*', module: 'news', action: '*' },
    { code: 'news.view', name: 'news.view', module: 'news', action: 'view' },
    { code: 'news.create', name: 'news.create', module: 'news', action: 'create' },
    { code: 'news.update', name: 'news.update', module: 'news', action: 'update' },
    { code: 'news.delete', name: 'news.delete', module: 'news', action: 'delete' },
    { code: 'file.*', name: 'file.*', module: 'file', action: '*' },
    { code: 'file.view', name: 'file.view', module: 'file', action: 'view' },
    { code: 'file.upload', name: 'file.upload', module: 'file', action: 'upload' },
    { code: 'file.delete', name: 'file.delete', module: 'file', action: 'delete' },
    { code: 'product.*', name: 'product.*', module: 'product', action: '*' },
    { code: 'product.view', name: 'product.view', module: 'product', action: 'view' },
    { code: 'product.create', name: 'product.create', module: 'product', action: 'create' },
    { code: 'product.update', name: 'product.update', module: 'product', action: 'update' },
    { code: 'product.delete', name: 'product.delete', module: 'product', action: 'delete' },
    { code: 'project.*', name: 'project.*', module: 'project', action: '*' },
    { code: 'project.view', name: 'project.view', module: 'project', action: 'view' },
    { code: 'project.create', name: 'project.create', module: 'project', action: 'create' },
    { code: 'project.update', name: 'project.update', module: 'project', action: 'update' },
    { code: 'project.delete', name: 'project.delete', module: 'project', action: 'delete' },
    { code: 'recruitment.*', name: 'recruitment.*', module: 'recruitment', action: '*' },
    { code: 'recruitment.view', name: 'recruitment.view', module: 'recruitment', action: 'view' },
    { code: 'recruitment.create', name: 'recruitment.create', module: 'recruitment', action: 'create' },
    { code: 'recruitment.update', name: 'recruitment.update', module: 'recruitment', action: 'update' },
    { code: 'recruitment.delete', name: 'recruitment.delete', module: 'recruitment', action: 'delete' },
    { code: 'application.*', name: 'application.*', module: 'application', action: '*' },
    { code: 'application.view', name: 'application.view', module: 'application', action: 'view' },
    { code: 'application.create', name: 'application.create', module: 'application', action: 'create' },
    { code: 'application.update', name: 'application.update', module: 'application', action: 'update' },
    { code: 'application.delete', name: 'application.delete', module: 'application', action: 'delete' },
    { code: 'comment.*', name: 'comment.*', module: 'comment', action: '*' },
    { code: 'comment.view', name: 'comment.view', module: 'comment', action: 'view' },
    { code: 'comment.create', name: 'comment.create', module: 'comment', action: 'create' },
    { code: 'comment.update', name: 'comment.update', module: 'comment', action: 'update' },
    { code: 'comment.delete', name: 'comment.delete', module: 'comment', action: 'delete' },
    { code: 'contact.*', name: 'contact.*', module: 'contact', action: '*' },
    { code: 'contact.view', name: 'contact.view', module: 'contact', action: 'view' },
    { code: 'contact.create', name: 'contact.create', module: 'contact', action: 'create' },
    { code: 'contact.update', name: 'contact.update', module: 'contact', action: 'update' },
    { code: 'contact.delete', name: 'contact.delete', module: 'contact', action: 'delete' },
    { code: 'setting.*', name: 'setting.*', module: 'setting', action: '*' },
    { code: 'setting.update', name: 'setting.update', module: 'setting', action: 'update' },
];

async function seedAdminRbac() {
    console.log('====================================================');
    console.log('--- SEEDING ADMIN & RBAC (ROLES, PERMISSIONS, USERS) ---');
    console.log('====================================================');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Ensure category_types exists & is populated
        console.log('1. Checking and seeding category_types...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS category_types (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL UNIQUE
            );
        `);
        for (const typeName of ['product', 'news', 'project']) {
            await client.query(`
                INSERT INTO category_types (name)
                VALUES ($1)
                ON CONFLICT (name) DO NOTHING;
            `, [typeName]);
        }
        console.log('   ✅ category_types initialized.');

        // 2. Seed Roles
        console.log('2. Seeding roles...');
        const roleDefinitions = [
            { code: 'super_admin', name: 'SUPER ADMINISTRATOR', description: 'Toàn quyền quản trị hệ thống tối cao', is_system: true },
            { code: 'admin', name: 'ADMIN', description: 'Quản trị viên hệ thống', is_system: true },
        ];

        const roleIds = {};
        for (const r of roleDefinitions) {
            const res = await client.query(`
                INSERT INTO roles (code, name, description, is_system, updated_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (code) DO UPDATE 
                SET name = $2, description = $3, is_system = $4, updated_at = NOW()
                RETURNING id, code;
            `, [r.code, r.name, r.description, r.is_system]);
            roleIds[r.code] = res.rows[0].id;
        }
        console.log('   ✅ Roles verified/created:', Object.keys(roleIds));

        // 3. Seed Permissions
        console.log('3. Seeding permissions...');
        const permIds = [];
        for (const p of PERMISSIONS_LIST) {
            const res = await client.query(`
                INSERT INTO permissions (code, name, module, action, updated_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (code) DO UPDATE
                SET name = $2, module = $3, action = $4, updated_at = NOW()
                RETURNING id;
            `, [p.code, p.name, p.module, p.action]);
            permIds.push(res.rows[0].id);
        }
        console.log(`   ✅ Seeded ${permIds.length} permissions.`);

        // 4. Assign all permissions to super_admin and admin
        console.log('4. Assigning permissions to roles...');
        for (const roleCode of ['super_admin', 'admin']) {
            const rId = roleIds[roleCode];
            for (const pId of permIds) {
                await client.query(`
                    INSERT INTO role_permissions (role_id, permission_id)
                    VALUES ($1, $2)
                    ON CONFLICT (role_id, permission_id) DO NOTHING;
                `, [rId, pId]);
            }
        }
        console.log('   ✅ All permissions attached to super_admin and admin roles.');

        // 5. Seed Users from ENV
        const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
        const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@saigonvalve.vn';

        const superUsername = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
        const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'Super@123';
        const superEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@saigonvalve.vn';

        const usersToSeed = [
            {
                username: adminUsername,
                email: adminEmail,
                password: adminPassword,
                full_name: 'ADMINISTRATOR',
                roleCode: 'admin',
            },
            {
                username: superUsername,
                email: superEmail,
                password: superPassword,
                full_name: 'SUPER ADMINISTRATOR',
                roleCode: 'super_admin',
            },
        ];

        console.log('5. Seeding admin users...');
        for (const u of usersToSeed) {
            const hash = await bcrypt.hash(u.password, 10);

            // Find existing user by username OR email
            const existRes = await client.query(`
                SELECT id FROM users WHERE username = $1 OR email = $2;
            `, [u.username, u.email]);

            let userId;
            if (existRes.rows.length > 0) {
                userId = existRes.rows[0].id;
                await client.query(`
                    UPDATE users 
                    SET username = $1, email = $2, password_hash = $3, full_name = $4, is_active = true, is_locked = false, updated_at = NOW()
                    WHERE id = $5;
                `, [u.username, u.email, hash, u.full_name, userId]);
                console.log(`   🔄 Updated user: ${u.username} (${u.email})`);
            } else {
                const insRes = await client.query(`
                    INSERT INTO users (username, email, password_hash, full_name, is_active, is_locked, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, true, false, NOW(), NOW())
                    RETURNING id;
                `, [u.username, u.email, hash, u.full_name]);
                userId = insRes.rows[0].id;
                console.log(`   ✨ Created user: ${u.username} (${u.email})`);
            }

            // Assign role
            const targetRoleId = roleIds[u.roleCode];
            if (targetRoleId) {
                await client.query(`
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES ($1, $2)
                    ON CONFLICT (user_id, role_id) DO NOTHING;
                `, [userId, targetRoleId]);
            }
        }

        await client.query('COMMIT');
        console.log('====================================================');
        console.log('--- ADMIN & RBAC SEEDING COMPLETED SUCCESSFULLY ---');
        console.log(`    Admin account: ${adminUsername} / (password configured in env)`);
        console.log(`    SuperAdmin account: ${superUsername} / (password configured in env)`);
        console.log('====================================================');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error during Admin & RBAC seeding:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seedAdminRbac().catch((err) => {
    console.error('Fatal seed error:', err);
    process.exit(1);
});
