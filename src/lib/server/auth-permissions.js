import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

export const statement = {
	...defaultStatements,
	public_link: ['create', 'view', 'update', 'delete'],
	video: ['upload', 'list', 'share', 'toggleDownload', 'delete'],
	file: ['watch', 'download'],
};

export const ac = createAccessControl(statement);

export const uploader = ac.newRole({
	public_link: ['create', 'view', 'update', 'delete'],
	video: ['upload', 'list', 'share', 'toggleDownload', 'delete'],
	file: ['watch', 'download'],
});

export const user = ac.newRole({
	public_link: ['view'],
	file: ['watch', 'download'],
});

export const admin = ac.newRole({
	public_link: ['create', 'view', 'update', 'delete'],
	video: ['upload', 'list', 'share', 'toggleDownload', 'delete'],
	file: ['watch', 'download'],
	...adminAc.statements,
});
