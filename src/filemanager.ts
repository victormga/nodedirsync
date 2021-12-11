import path from "path";
import fs from "fs";
import fetch from "node-fetch";

const resolve = function(fullpath: string): string {
	return path.resolve(fullpath).replace(/\\/g, "/")
}

const relative = function(fullpath: string, basedir: string): string {
	return resolve(fullpath).replace(basedir, "");
}

const exists = function(fullpath: string): Promise<boolean> {
	return fs.promises.access(fullpath, fs.constants.F_OK).then(() => true).catch(() => false);
}

const info = async function(fullpath: string): Promise<{modified: number, is_directory: boolean}> {
	const stat = await fs.promises.stat(fullpath);
	return {
		modified: ((stat.ctime > stat.mtime) ? stat.ctime : stat.mtime).getTime(),
		is_directory: stat.isDirectory(),
	};
}

const is_outdated = async function(fullpath: string, remote_timestamp: number): Promise<boolean> {
	try {
		const fileinfo = await info(fullpath);
		return (fileinfo.modified < remote_timestamp);
	} catch(e) {
		return true;
	}
}

const require_dir = async function(fullpath: string): Promise<void> {
	if (!await exists(fullpath)) fs.promises.mkdir(fullpath, { recursive: true });
}

const remove = async function(fullpath: string): Promise<void> {
	if (!await exists(fullpath)) return;

	try {
		const pathinfo = await info(fullpath);
		if (pathinfo.is_directory) {
			await fs.promises.rm(fullpath, { recursive: true });
		} else {
			await fs.promises.unlink(fullpath);
		}
	} catch(e) {}
}

const download = async function(url: string, dest: string): Promise<void> {
	await require_dir(path.dirname(dest));

	const res = await fetch(url);
	const stream = fs.createWriteStream(dest);
	
	await new Promise((resolve, reject) => {
		if (res.body === null) return;
		res.body.pipe(stream);
		res.body.on("error", reject);
		stream.on("finish", resolve);
	});
}

export default {
	resolve,
	relative,
	exists,
	is_outdated,
	require_dir,
	download,
	info,
	remove
}