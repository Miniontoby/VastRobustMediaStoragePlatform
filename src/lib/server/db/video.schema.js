import { mysqlTable, boolean, index, int, text, varchar, timestamp, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';

export const upload = mysqlTable(
	'upload',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		filename: text('filename').notNull(),
		totalChunks: int('total_chunks').notNull(),
		receivedChunks: json('received_chunks').notNull().default([]),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { fsp: 3 })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("upload_userId_idx").on(table.userId)],
);

export const video = mysqlTable(
	'video',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		filename: text('filename').notNull(),
		fileSize: int('filesize').notNull(),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { fsp: 3 })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("video_userId_idx").on(table.userId)],
);

export const publicLink = mysqlTable(
	'public_link',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		videoId: varchar('video_id', { length: 36 })
			.notNull()
			.references(() => video.id, { onDelete: 'cascade' }),
		URL: text('url').notNull().unique(),
		downloadingEnabled: boolean('downloading_enabled').notNull().default(false),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { fsp: 3 })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("publicLink_video_idx").on(table.videoId)],
);

export const uploadRelations = relations(upload, ({ one }) => ({
	user: one(user, {
		fields: [upload.userId],
		references: [user.id],
	}),
}));

export const videoRelations = relations(video, ({ one }) => ({
	user: one(user, {
		fields: [video.userId],
		references: [user.id],
	}),
}));

export const publicLinkRelations = relations(publicLink, ({ one }) => ({
	video: one(video, {
		fields: [publicLink.videoId],
		references: [video.id],
	}),
}));