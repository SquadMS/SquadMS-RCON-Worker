import { ContainerModuleLoadOptions } from "inversify";
import ServiceProvider from "../../core/Foundation/ServiceProvider.ts";
import ConnectionManager, { ConnectionManagerId } from "./ConnectionManager.ts";

export default class WelcomeServiceProvider extends ServiceProvider {
    // deno-lint-ignore require-await
    public async register(module: ContainerModuleLoadOptions): Promise<void> {
        module.bind(ConnectionManagerId).to(ConnectionManager)
            .inSingletonScope();
    }

    public async boot(): Promise<void> {
        //
    }
}
