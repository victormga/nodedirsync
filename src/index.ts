import server from "./server";
import client from "./client";
import clparser from "command-line-args";
import colors from "colors/safe";

let args;
try {
	args = clparser([
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
} catch(e: any) {
	console.log(colors.red(e.message));
	console.log("use -h or --help to see the options");
	process.exit(1);
}

console.log(colors.green("> NodeDirSync v1.0.0"));
console.log("");

if (args.version) {
	process.exit(0);
}

if (args.help) {
	console.log(colors.bold("> HELP: "));
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
	console.log("\t regexp to ignore. multi entries accepted");

	console.log(" -p PORT, --port PORT");
	console.log("\t port used to listen/connect. defaults to 3337");

	console.log(" -r REMOTE, --remote REMOTE");
	console.log("\t remote ip to connect. client only");

	console.log(" -q, --quiet");
	console.log("\t do not output logs");

	process.exit(0);
}

if (args.client) {
	client(args.directory, args.remote, args.port, args.ignore, args.quiet);
} else
if (args.server) {
	server(args.directory, args.port, args.ignore, args.quiet);
}