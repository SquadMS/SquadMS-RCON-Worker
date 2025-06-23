import Application from "./Application.ts";
import { ApplicationInterface } from "./Foundation/ApplicationInterface.ts";

export function app(): ApplicationInterface {
    return Application.getInstance();
}
