import SquadRCONWorker from'./SquadRCONWorker.js';
import Logger from './RCON/core/logger.js';

/* Configure Logger */
Logger.setVerboseness('RCON', 1);
Logger.setVerboseness('SquadRcon', 1);
Logger.setVerboseness('Worker', 1);
Logger.setVerboseness('APIClient', 1);
Logger.setVerboseness('APIServer', 1);

/* Initialize the Worker */
const worker = new SquadRCONWorker();

/* Register stop listeners to shutdown gracefully */
process.on('SIGTERM', () => {
    worker.running = false;
})
process.on('SIGINT', () => {
    worker.running = false;
});

/* Run it */
worker.run();