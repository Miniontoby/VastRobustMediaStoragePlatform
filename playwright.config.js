import { defineConfig } from '@playwright/test';

/*
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './src/lib/server/db/index.js';

migrate(db, {
 	migrationsFolder: "./drizzle",
});
*/

export default defineConfig({
	webServer: { command: 'pnpm build && pnpm preview', port: 4173, timeout: 10 * 60e3 },
	testMatch: '**/*.e2e.{ts,js}',
	// workers: 1, // should use only one when doing DB operations
});
