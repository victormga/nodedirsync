# NodeDirSync
**NodeDirSync** is a small program written in *typescript*, using *node.js* as runtime.
The objective of this program is to allow the user to synchronize **files** between two computers, on the same local network or over the internet, utilizing the *http* protocol and *websockets*.

## Client/Server architeture
Both *client* and *server* functionalities are included on the same package, giving you the possibility to run it as a **server** or as a **client**. Nonetheless, you have to choose one of the computers to be the **server**, and others to be **clients**, and the **server** files will always be considered *the source of truth*.
You can have how many clients you want, but only one server.

## Realtime
When first connecting, the *client* will receive a updated list of the files from the *server*, check what needs to be downloaded, and do the primary sync. After that, it'll create a socket connection to receive updates.
When synced, only modified files on the server will be transferred to the clients.

## Performance

**Diff** is not a thing in this program. It uses *modification time* to check if it needs to download the new version of the file, and then, downloads the whole file. This is not a problem when using for source-code (*original objective*) or small files, but can become a problem when watching bigger files (*200mb+ for local network, 10mb+ for remote*) that changes a lot.


## Examples

 To start as a server, run something like:
- `node . --server --directory /home/myserveruser/myserverfolder` or
- `node . -s -d /home/myserveruser/myserverfolder`

To start as a client, run something like:
- `node . --client --directory /home/myclientuser/myclientfolder --remote 192.168.0.101` or
- `node . -c -d /home/myclientuser/myclientfolder -r 192.168.0.101`


## Flags and arguments
- `-v or --version`: show version.
- `-h or --help`: show help.
- `-c or --client`: run app as a client.
- `-s or --server`: run app as a server.
- `-d or --directory`: root directory to watch. use **absolute path** only. defaults to *cwd*.
- `-i or --ignore`: ignore list. looks like a **.gitignore** file. multiple entries are accepted. 
(example: `-i /node_modules /.git ./dist/fonts`)
- `-p or --port`: custom port for the server/client to use. defaults to **3337**.
- `-r or --remote`: *(client only)* remote server ip to connect.
- `-q or --quiet`: do not display logs.