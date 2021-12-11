"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const resolve = function (fullpath) {
    return path_1.default.resolve(fullpath).replace(/\\/g, "/");
};
const relative = function (fullpath, basedir) {
    return resolve(fullpath).replace(basedir, "");
};
const exists = function (fullpath) {
    return fs_1.default.promises.access(fullpath, fs_1.default.constants.F_OK).then(() => true).catch(() => false);
};
const info = async function (fullpath) {
    const stat = await fs_1.default.promises.stat(fullpath);
    return {
        modified: ((stat.ctime > stat.mtime) ? stat.ctime : stat.mtime).getTime(),
        is_directory: stat.isDirectory(),
    };
};
const is_outdated = async function (fullpath, remote_timestamp) {
    try {
        const fileinfo = await info(fullpath);
        return (fileinfo.modified < remote_timestamp);
    }
    catch (e) {
        return true;
    }
};
const require_dir = async function (fullpath) {
    if (!await exists(fullpath))
        fs_1.default.promises.mkdir(fullpath, { recursive: true });
};
const remove = async function (fullpath) {
    if (!await exists(fullpath))
        return;
    try {
        const pathinfo = await info(fullpath);
        if (pathinfo.is_directory) {
            await fs_1.default.promises.rm(fullpath, { recursive: true });
        }
        else {
            await fs_1.default.promises.unlink(fullpath);
        }
    }
    catch (e) { }
};
const download = async function (url, dest) {
    await require_dir(path_1.default.dirname(dest));
    const res = await (0, node_fetch_1.default)(url);
    const stream = fs_1.default.createWriteStream(dest);
    await new Promise((resolve, reject) => {
        if (res.body === null)
            return;
        res.body.pipe(stream);
        res.body.on("error", reject);
        stream.on("finish", resolve);
    });
};
exports.default = {
    resolve,
    relative,
    exists,
    is_outdated,
    require_dir,
    download,
    info,
    remove
};
