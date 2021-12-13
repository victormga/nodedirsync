"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const client_1 = __importDefault(require("./client"));
const command_line_args_1 = __importDefault(require("command-line-args"));
const safe_1 = __importDefault(require("colors/safe"));
const VERSION = "1.0.1";
let args;
try {
    args = (0, command_line_args_1.default)([
        { name: "version", alias: "v", type: Boolean, defaultValue: false },
        { name: "help", alias: "h", type: Boolean, defaultValue: false },
        { name: "client", alias: "c", type: Boolean, defaultValue: false },
        { name: "server", alias: "s", type: Boolean, defaultValue: false },
        { name: "directory", alias: "d", type: String, defaultValue: process.cwd() },
        { name: "ignore", alias: "i", type: String, multiple: true, defaultValue: [] },
        { name: "port", alias: "p", type: Number, defaultValue: 3337 },
        { name: "remote", alias: "r", type: String, defaultValue: "" },
        { name: "quiet", alias: "q", type: Boolean, defaultValue: false }
    ]);
}
catch (e) {
    console.log(safe_1.default.red(e.message));
    console.log("use -h or --help to see the options");
    process.exit(1);
}
console.log(safe_1.default.green(`> NodeDirSync v${VERSION}`));
console.log("");
if (args.version) {
    process.exit(0);
}
if (args.help) {
    console.log(safe_1.default.bold("> HELP: "));
    console.log("");
    console.log(" -v, --version");
    console.log("\t show version");
    console.log(" -h, --help");
    console.log("\t show help");
    console.log(" -c, --client");
    console.log("\t run as client");
    console.log(" -s, --server");
    console.log("\t run as server");
    console.log(" -d <DIRECTORY>, --directory <DIRECTORY>");
    console.log("\t root directory to watch. absolute path only. defaults to cwd");
    console.log(" -i [<REGEXP>], --ignore [<REGEXP>]");
    console.log("\t ignore list. multi entries accepted");
    console.log(" -p PORT, --port PORT");
    console.log("\t port used to listen/connect. defaults to 3337");
    console.log(" -r REMOTE, --remote REMOTE");
    console.log("\t remote ip to connect. client only");
    console.log(" -q, --quiet");
    console.log("\t do not output logs");
    process.exit(0);
}
if (args.client) {
    (0, client_1.default)(args.directory, args.remote, args.port, args.ignore, args.quiet);
}
else if (args.server) {
    (0, server_1.default)(args.directory, args.port, args.ignore, args.quiet);
}
