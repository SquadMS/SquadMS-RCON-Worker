import { ContainerModuleLoadOptions } from 'inversify';
import ServiceProvider from '../../core/Foundation/ServiceProvider.ts';
import RCON, { serviceId } from './RCON.ts';

export default class WelcomeServiceProvider extends ServiceProvider
{
    // deno-lint-ignore require-await
    public async register(module: ContainerModuleLoadOptions): Promise<void>
    {
        module.bind(serviceId).to(RCON)
    }

    public async boot(): Promise<void>
    {
        //
    }
}