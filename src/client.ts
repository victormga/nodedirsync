import { io } from "socket.io-client";
import path from "path";
import { list as list_files } from "recursive-readdir-async";
import filemanager from "./filemanager";
import colors from "colors/safe";

export default function(dir: string, ip: string, port: number, ignore: string[], quiet: boolean) {
	const basedir = filemanager.resolve(dir);
	const server_addr = `http://${ip}:${port}`;
	const socket = io(server_addr);

	socket.on("connect", () => {
		console.log(colors.green(`> CONNECTED TO [${server_addr}]`));
	});

	socket.on("connect_error", (e) => {
		console.error(colors.red(`> FAILED TO ESTABLISH CONNECTION WITH [${server_addr}]`));
		process.exit(0);
	});

	socket.on("disconnect", () => {
		console.error(colors.red("> SOCKET DISCONNECTED"));
		process.exit(0);
	});

	socket.on("sync", async (syncs) => {
		console.log(colors.bold(colors.yellow(`> SYNCING: [${syncs.length}] files found on the server.`)));

		syncs.forEach(async (remote: any) => {
			const localpath = filemanager.resolve(path.join(basedir, "/", remote.filename));
			
			if (!await filemanager.exists(localpath) || await filemanager.is_outdated(localpath, remote.modified)) {
				if (remote.is_directory) {
					if (!quiet) console.log(colors.blue(`> UPDATE: Syncing directory [${remote.filename}]`));
					await filemanager.require_dir(localpath);
				} else {
					if (!quiet) console.log(colors.blue(`> UPDATE: Downloading new file [${remote.filename}]`));
					await filemanager.download(`${server_addr}/download${remote.filename}`, localpath);
				}
			}
		});

		const server_filenames = syncs.map((sync: any) => sync.filename);

		const local_files = await list_files(basedir, { 
			stats: true, 
			ignoreFolders: false,
			exclude: ignore,
		});

		local_files.forEach((file: any) => {
			const path = file.fullname;
			const filename = filemanager.relative(path, basedir);
			if (!server_filenames.includes(filename)) {
				if (!quiet) console.log(colors.red(`> REMOVE: Removing local path [${filename}]`));
				filemanager.remove(path);
			}
		});
	});

	socket.on("changes", (changes) => {
		changes.map(async (remote: any) => {
			const localpath = filemanager.resolve(path.join(basedir, "/", remote.filename));
			
			if (remote.event === "remove") {
				if (!quiet) console.log(colors.red(`> REMOVE: Removing local path [${remote.filename}]`));
				filemanager.remove(localpath);
			}
			
			if (remote.event === "update") {
				if (!await filemanager.exists(localpath) || await filemanager.is_outdated(localpath, remote.modified)) {
					if (remote.is_directory) {
						if (!quiet) console.log(colors.green(`> UPDATE: Creating new directory [${remote.filename}]`));
						filemanager.require_dir(localpath);
					} else {
						if (!quiet) console.log(colors.green(`> UPDATE: Downloading new file [${remote.filename}]`));
						await filemanager.download(`${server_addr}/download${remote.filename}`, localpath);
					}
				}
			}
		});
	});
}