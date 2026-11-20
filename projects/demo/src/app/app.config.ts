import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideDroneWalkthrough } from 'drone-walkthrough';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // showTodoBadges: false hides the orange "ต้องเปลี่ยน" badges once real media is in.
    provideDroneWalkthrough({ assetBase: 'assets/drone-walkthrough/', showTodoBadges: true }),
  ],
};
