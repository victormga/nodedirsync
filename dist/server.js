"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_watch_1 = __importDefault(require("node-watch"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const recursive_readdir_async_1 = require("recursive-readdir-async");
const filemanager_1 = __importDefault(require("./filemanager"));
const safe_1 = __importDefault(require("colors/safe"));
function default_1(dir, port, ignore, quiet) {
    const basedir = filemanager_1.default.resolve(dir);
    const ignore_list = ignore.map((i) => new RegExp(i));
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server);
    app.use("/download", express_1.default.static(basedir, { dotfiles: "allow" }));
    io.on("connection", async (socket) => {
        console.log(safe_1.default.bold(safe_1.default.yellow("> New client connected")));
        const files = await (0, recursive_readdir_async_1.list)(basedir, {
            stats: true,
            ignoreFolders: false,
            exclude: ignore,
        });
        const syncs = files.map((file) => {
            const path = file.fullname;
            const filename = filemanager_1.default.relative(path, basedir);
            const modified = ((file.stats.ctime > file.stats.mtime) ? file.stats.ctime : file.stats.mtime).getTime();
            return {
                event: "update",
                filename: filename,
                modified: modified,
                is_directory: file.isDirectory
            };
        });
        socket.emit("sync", syncs);
    });
    const watch_options = {
        recursive: true,
        filter(path, skip) {
            const filename = filemanager_1.default.relative(path, basedir);
            for (const ignore of ignore_list) {
                if (ignore.test(filename))
                    return skip;
            }
            return true;
        }
    };
    (0, node_watch_1.default)(basedir, watch_options, async function (evt, path) {
        if (!evt || !path)
            return;
        const filename = filemanager_1.default.relative(path, basedir);
        const change = {
            event: evt,
            filename: filename,
            modified: 0,
            is_directory: false
        };
        if (evt === "update") {
            try {
                const info = await filemanager_1.default.info(path);
                change.modified = info.modified;
                change.is_directory = info.is_directory;
            }
            catch (e) { }
            if (!quiet)
                console.log(safe_1.default.blue(`> UPDATE DETECTED: [${filename}]`));
        }
        if (evt === "remove") {
            change.modified = Date.now();
            if (!quiet)
                console.log(safe_1.default.red(`> DELETION DETECTED: [${filename}]`));
        }
        io.emit("changes", [change]);
    });
    server.listen(port, () => {
        console.log(safe_1.default.bold(safe_1.default.yellow(`> Watching directory: [${basedir}]`)));
        console.log(safe_1.default.cyan(`> Ignoring:`));
        ignore.forEach(i => console.log(safe_1.default.cyan(`\t- ${i}`)));
        console.log(safe_1.default.green(`> DirSync server listening on: ${port}`));
        console.log("");
        console.log("_____________________________");
        console.log("");
        console.log("");
    });
}
exports.default = default_1;
