# SquadMS-RCON-Worker
The SquadMS RCON Worker, meant to be deployed seperately and to communicate using a small API. 
Does solve the multiple RCON connections issue efficiently if used correctly. Currently RCON only.

# Requirements
- Node.js
- NPM

If you are on a debian devirate, you can install the latest version of Node.js and NPM using the following command:
```
sudo apt update && sudo apt upgrade -y && sudo apt install nodejs npm && sudo npm i -g n && sudo n latest
```

# Installation
To install it, simply clone/download the repository, open the folder in a command line and run 
the following command:
```
npm install
```

# Todo's
- Clean up Log output and omit unecessary information
- Correctly integrate SquadJS as an dependency to improve maintainability
- Test server change endpoint
- Add HTTPS support to run secure without an reverse proxy
- Add auth token support to APIServer

# Thanks
- [Tommy S.](https://github.com/Thomas-Smyth) creator of SquadJS and the RCON implementation
