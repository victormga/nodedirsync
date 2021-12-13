import express from "express";
import watch from "node-watch";
import { Server } from "socket.io";
import http from "http";
import { list as list_files } from "recursive-readdir-async";
import filemanager from "./filemanager";
import colors from "colors/safe";

export default function(dir: string, port: number, ignore: string[], quiet: boolean) {
	const basedir = filemanager.resolve(dir);
	const ignore_list = ignore.map((i) => new RegExp(i));

	const app = express();
	const server = http.createServer(app);
	const io = new Server(server);

	app.use("/download", express.static(basedir, { dotfiles: "allow" }));

	io.on("connection", async (socket) => { 
		console.log(colors.bold(colors.yellow("> New client connected")));
		const files = await list_files(basedir, { 
			stats: true, 
			ignoreFolders: false,
			exclude: ignore,
		});
		const syncs = files.map((file: any) => {
			const path = file.fullname;
			const filename = filemanager.relative(path, basedir);
			const modified = ((file.stats.ctime > file.stats.mtime) ? file.stats.ctime : file.stats.mtime).getTime();
			return {
				event: "update",
				filename: filename,
				modified: modified,
				is_directory: file.isDirectory
			}
		});
		socket.emit("sync", syncs);
	});

	const watch_options = {
		recursive: true,
		filter(path: string, skip: any) {
			const filename = filemanager.relative(path, basedir);
			for (const ignore of ignore_list) {
				if (ignore.test(filename)) return skip;
			}
			return true;
		}
	}
	watch(basedir, watch_options, async function(evt, path) { 
		if (!evt || !path) return;
		const filename = filemanager.relative(path, basedir)

		const change = {
			event: evt,
			filename: filename,
			modified: 0,
			is_directory: false
		};

		if (evt === "update") {
			try {
				const info = await filemanager.info(path);
				change.modified = info.modified;
				change.is_directory = info.is_directory;
			} catch(e) { }
			if (!quiet) console.log(colors.blue(`> UPDATE DETECTED: [${filename}]`));
		}

		if (evt === "remove") {
			change.modified = Date.now();
			if (!quiet) console.log(colors.red(`> DELETION DETECTED: [${filename}]`));
		}

		io.emit("changes", [change]);
	});

	server.listen(port, () => {
		console.log(colors.bold(colors.yellow(`> Watching directory: [${basedir}]`)));
		console.log(colors.cyan(`> Ignoring:`));
		ignore.forEach(i => console.log(colors.cyan(`\t- ${i}`)));
		console.log(colors.green(`> DirSync server listening on: ${port}`));
		console.log("");
		console.log("_____________________________");
		console.log("");
		console.log("");
	});
}