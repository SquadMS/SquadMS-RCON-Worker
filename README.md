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
The worker can be installed as standalone or as an dependency to your existing project.

## Standalone
This will install only the rcon worker, assuming you are already running your API-Backend somewhere else.

### Installation
To install it as standalone, simply clone/download the repository, open the folder in a command line and run 
the following command:
```
npm i
```

### Running
To start it, simply run the follwing command:
```
npm run start
```

## Dependency
This will add the rcon-worker to your project as an dependency. That way it will always be shipped & updated with yout main project (assuming it has a package.json).

### Installation
To install it as an dependency of your project, simply run the following command to add it to your package.json:
```
npm i @squadms/rcon-worker
```

### Running
To start it, simply run the follwing command:
```
npm explore @squadms/rcon-worker -- npm run start
```

# Todo's
- Clean up Log output and omit unecessary information
- Correctly integrate SquadJS as an dependency to improve maintainability
- Test server change endpoint
- Add HTTPS support to run secure without an reverse proxy
- Add auth token support to APIServer

# Thanks
- [Tommy S.](https://github.com/Thomas-Smyth) creator of SquadJS and the RCON implementation
