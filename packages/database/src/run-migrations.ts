import 'reflect-metadata';
import dataSource from './datasource';

async function run() {
  await dataSource.initialize();
  console.log('[migration] Running pending migrations...');
  const migrations = await dataSource.runMigrations();
  if (migrations.length === 0) {
    console.log('[migration] No pending migrations.');
  } else {
    for (const m of migrations) {
      console.log(`[migration] Applied: ${m.name}`);
    }
  }
  await dataSource.destroy();
  console.log('[migration] Done.');
}

run().catch((err) => {
  console.error('[migration] Failed:', err);
  process.exit(1);
});
