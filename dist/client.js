"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const path_1 = __importDefault(require("path"));
const recursive_readdir_async_1 = require("recursive-readdir-async");
const filemanager_1 = __importDefault(require("./filemanager"));
const safe_1 = __importDefault(require("colors/safe"));
function default_1(dir, ip, port, ignore, quiet) {
    const basedir = filemanager_1.default.resolve(dir);
    const server_addr = `http://${ip}:${port}`;
    const socket = (0, socket_io_client_1.io)(server_addr);
    socket.on("connect", () => {
        console.log(safe_1.default.green(`> CONNECTED TO [${server_addr}]`));
    });
    socket.on("connect_error", (e) => {
        console.error(safe_1.default.red(`> FAILED TO ESTABLISH CONNECTION WITH [${server_addr}]`));
        process.exit(0);
    });
    socket.on("disconnect", () => {
        console.error(safe_1.default.red("> SOCKET DISCONNECTED"));
        process.exit(0);
    });
    socket.on("sync", async (syncs) => {
        console.log(safe_1.default.bold(safe_1.default.yellow(`> SYNCING: [${syncs.length}] files found on the server.`)));
        syncs.forEach(async (remote) => {
            const localpath = filemanager_1.default.resolve(path_1.default.join(basedir, "/", remote.filename));
            if (!await filemanager_1.default.exists(localpath) || await filemanager_1.default.is_outdated(localpath, remote.modified)) {
                if (remote.is_directory) {
                    if (!quiet)
                        console.log(safe_1.default.blue(`> UPDATE: Syncing directory [${remote.filename}]`));
                    await filemanager_1.default.require_dir(localpath);
                }
                else {
                    if (!quiet)
                        console.log(safe_1.default.blue(`> UPDATE: Downloading new file [${remote.filename}]`));
                    await filemanager_1.default.download(`${server_addr}/download${remote.filename}`, localpath);
                }
            }
        });
        const server_filenames = syncs.map((sync) => sync.filename);
        const local_files = await (0, recursive_readdir_async_1.list)(basedir, {
            stats: true,
            ignoreFolders: false,
            exclude: ignore,
        });
        local_files.forEach((file) => {
            const path = file.fullname;
            const filename = filemanager_1.default.relative(path, basedir);
            if (!server_filenames.includes(filename)) {
                if (!quiet)
                    console.log(safe_1.default.red(`> REMOVE: Removing local path [${filename}]`));
                filemanager_1.default.remove(path);
            }
        });
    });
    socket.on("changes", (changes) => {
        changes.map(async (remote) => {
            const localpath = filemanager_1.default.resolve(path_1.default.join(basedir, "/", remote.filename));
            if (remote.event === "remove") {
                if (!quiet)
                    console.log(safe_1.default.red(`> REMOVE: Removing local path [${remote.filename}]`));
                filemanager_1.default.remove(localpath);
            }
            if (remote.event === "update") {
                if (!await filemanager_1.default.exists(localpath) || await filemanager_1.default.is_outdated(localpath, remote.modified)) {
                    if (remote.is_directory) {
                        if (!quiet)
                            console.log(safe_1.default.green(`> UPDATE: Creating new directory [${remote.filename}]`));
                        filemanager_1.default.require_dir(localpath);
                    }
                    else {
                        if (!quiet)
                            console.log(safe_1.default.green(`> UPDATE: Downloading new file [${remote.filename}]`));
                        await filemanager_1.default.download(`${server_addr}/download${remote.filename}`, localpath);
                    }
                }
            }
        });
    });
}
exports.default = default_1;
