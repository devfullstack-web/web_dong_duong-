#!/usr/bin/env node
/**
 * SGV Web Dong Duong - Drizzle Programmatic Migrator
 * Chạy các file migration trong thư mục drizzle/ bằng drizzle-orm/node-postgres/migrator
 * Hoặc kiểm tra trạng thái các bảng & migrations.
 */

const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');

const action = process.argv[2] || 'status';
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Lỗi: Thiếu biến môi trường DATABASE_URL.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  connectionTimeoutMillis: 10000,
});

async function runMigrate() {
  console.log('🔄 Đang kết nối tới PostgreSQL để chạy migrations...');
  const client = await pool.connect();
  try {
    const db = drizzle(client);
    const migrationsFolder = path.resolve(__dirname, '../drizzle');

    console.log(`📂 Thư mục migrations: ${migrationsFolder}`);
    console.log('⏳ Đang áp dụng các migration chưa chạy...');

    await migrate(db, { migrationsFolder });

    console.log('====================================================');
    console.log('✅ CHẠY MIGRATIONS THÀNH CÔNG!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Lỗi khi chạy migration:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function checkStatus() {
  console.log('🔎 Đang kiểm tra trạng thái Database & Migrations...');
  const client = await pool.connect();
  try {
    // 1. Kiểm tra danh sách bảng
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📋 Các bảng hiện có trong public schema:');
    if (tablesRes.rows.length === 0) {
      console.log('  (Chưa có bảng nào)');
    } else {
      tablesRes.rows.forEach((r, idx) => {
        console.log(`  ${(idx + 1).toString().padStart(2, ' ')}. ${r.table_name}`);
      });
    }

    // 2. Kiểm tra tracking table của Drizzle
    const migCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
      );
    `);

    console.log('\n📜 Lịch sử Drizzle Migrations (__drizzle_migrations):');
    if (migCheck.rows[0].exists) {
      const history = await client.query(`
        SELECT id, hash, created_at 
        FROM drizzle.__drizzle_migrations 
        ORDER BY id ASC;
      `);
      if (history.rows.length === 0) {
        console.log('  (Bảng tồn tại nhưng chưa có bản ghi nào)');
      } else {
        history.rows.forEach((h) => {
          const dateStr = h.created_at ? new Date(Number(h.created_at)).toLocaleString('vi-VN') : '—';
          console.log(`  [ID ${h.id}] ${dateStr} - Hash: ${h.hash.substring(0, 16)}...`);
        });
      }
    } else {
      console.log('  (Chưa tạo bảng tracking drizzle.__drizzle_migrations)');
    }

    // 3. Đọc journal local
    const journalPath = path.resolve(__dirname, '../drizzle/meta/_journal.json');
    if (fs.existsSync(journalPath)) {
      try {
        const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
        console.log(`\n📁 Danh sách migration trong source code (${journal.entries?.length || 0} entries):`);
        journal.entries?.forEach((entry) => {
          console.log(`  [idx ${entry.idx}] ${entry.tag} (${new Date(entry.when).toLocaleString('vi-VN')})`);
        });
      } catch (e) {
        // ignore
      }
    }
    console.log('\n✅ Kiểm tra trạng thái hoàn tất.');
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra DB:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  if (action === 'migrate' || action === 'run') {
    await runMigrate();
  } else if (action === 'status' || action === 'check') {
    await checkStatus();
  } else {
    console.log(`Lệnh không hợp lệ: ${action}. Hỗ trợ: migrate | status`);
    process.exit(1);
  }
}

main();
