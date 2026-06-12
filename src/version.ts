import pkg from '../package.json';

/** Single source of truth — always in sync with package.json */
export const APP_VERSION: string = pkg.version;
