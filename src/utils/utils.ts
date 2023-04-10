import { readFileSync } from "fs";
let appConfig: any = null;

export const loadAppConfig = (configPath?: any) => {

    if (configPath) {
        appConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    }
    return appConfig;
};