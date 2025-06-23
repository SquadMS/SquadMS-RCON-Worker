import { ContainerModuleLoadOptions } from "inversify";
import ServiceProvider from "../Foundation/ServiceProvider.ts";
import { Log, serviceId } from "./Log.ts";
import args from "../Arguments.ts";
import { VerbosityNumber, verbosityToString } from "./Verbosity.ts";

export default class LoggingServiceProvider extends ServiceProvider {
    public async register(module: ContainerModuleLoadOptions): Promise<void> {
        await module.bind<Log>(serviceId).toDynamicValue(() => {
            // Initialize the Log instance
            return new Log(
                // Determine the provided verbosity level
                args["--verbose"]
                    ? verbosityToString(args["--verbose"] as VerbosityNumber)
                    : "error",
            );
        }).inSingletonScope();
    }

    public async boot(): Promise<void> {
        //
    }
}
