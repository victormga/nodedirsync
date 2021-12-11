
# NodeDirSync

**NodeDirSync** is a small program written in *typescript*, using *node.js* as runtime.
The objective of this software is to allow the user to synchronize files between two computers, on the same local network or over the internet, utilizing the *http* protocol and *websockets*.

  

## Client/Server architeture
Both *client* and *server* functionalities are included on the same package, giving you the possibility to run it as a **server** or as a **client**. Nonetheless, you have to choose one of the computers to be the **server**, and others to be **clients**. The **server** files will always be considered *the source of truth*.
You can have how many clients you want, but only one server.

  

## Realtime
When first connecting, the *client* will receive a updated list of the files from the *server*, check what needs to be downloaded, and do the primary sync. After that, it'll create a socket connection to receive updates.

When synced, only modified files on the server will be transferred to the clients.

  

## Performance
**Diff** is not a thing in this program. It uses *modification time* to check if it needs to download the new version of the file, and then, downloads the whole file. This is not a problem when using for source-code (*original objective*) or small files, but can become a problem when watching bigger files (*200mb+ for local network, 10mb+ for remote*) that changes a lot.


## Security
SSL Encryption **was not** implemented on the v1.0.0 version, since it was firstly designed to work on a *local-network* environment. That being said, **be careful** with what you share over the internet.
I have plans to implement it in the future, along with other features. [PR's are welcome](https://github.com/victormga/nodedirsync/pulls).

  
  

# Examples

  

## 1 - Running from source

  
Download or clone the repository.

To run as a server, run something like:

-  `node . \--server --directory /home/myserveruser/myserverfolder` or

-  `node . -s -d /home/myserveruser/myserverfolder`

To run as a client, run something like:

-  `node . --client --directory /home/myclientuser/myclientfolder --remote 192.168.0.101` or

-  `node . -c -d /home/myclientuser/myclientfolder -r 192.168.0.101`


## 2 - Running from NPM
Comming soon.


## 3 - Running from a binary release
With this method, you **do not** need nodejs installed on the machine.
Download a release for your OS [here](https://github.com/victormga/nodedirsync/releases/tag/v1.0.0). Binaries are available for 
- Windows x64 with node16
- MacOS x64 with node16
- Linux x64 with node16

For more releases, you can easily build it yourself by editting the  **"pkg:"** session in the **package.json**, and ruinning `npm run build`
*This requires the **pkg**  package being installed globally. You can get it [here](https://www.npmjs.com/package/pkg)*.

To run as a server, run something like (windows example):

-  `nodedirsync-win.exe --server --directory D:/example/myserverfolder` or

-  `nodedirsync-win.exe -s -d D:/example/myserverfolder`

To run as a client, run something like (linux example):

-  `nodedirsync-linux --client --directory /home/example/myclientfolder --remote 192.168.0.101` or

-  `nodedirsync-linux -c -d /home/example/myclientfolder -r 192.168.0.101`
  
  

## Flags and arguments

-  `-v or --version`: show version.

-  `-h or --help`: show help.

-  `-c or --client`: run app as a client.

-  `-s or --server`: run app as a server.

-  `-d or --directory`: root directory to watch. use **absolute path** only. defaults to *cwd*.

-  `-i or --ignore`: ignore list. looks like a **.gitignore** file. multiple entries are accepted.

(example: `-i /node_modules /.git ./dist/fonts`)

-  `-p or --port`: custom port for the server/client to use. defaults to **3337**.

-  `-r or --remote`: *(client only)* remote server ip to connect.

-  `-q or --quiet`: do not display logs.

# Disclaimer
This softwares was **not** tested in all situations and with all filetypes.
The only scenario where it was extensivelly tested is with *sourcecode* files in a *local network* environment.
So, it's **not** guaranteed it will work for your use case.

# License

ISC License (ISC)
Copyright 2021 - Victor Hugo Sabiar

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.