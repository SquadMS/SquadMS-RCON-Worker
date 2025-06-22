import { ContainerModuleLoadOptions } from "inversify";
import ServiceProvider from "./Foundation/ServiceProvider.ts";
import Shutdown, { serviceId as shutdownServiceId } from "./Shutdown.ts";

export default class CoreServiceProvider extends ServiceProvider
{
    // deno-lint-ignore require-await
    public async register(module: ContainerModuleLoadOptions): Promise<void> {
        // Bind the Shutdown manager to the container
        module.bind<Shutdown>(shutdownServiceId).to(Shutdown).inSingletonScope()
    }

    public async boot(): Promise<void> {
        //
    }
}