import { EnvironmentProviders, InjectionToken, Pipe, PipeTransform, inject, makeEnvironmentProviders } from '@angular/core';

export interface DroneWalkthroughConfig {
  /** Where the library's assets are served. Default 'assets/drone-walkthrough/'. */
  assetBase: string;
  /** Show the orange "ต้องเปลี่ยน" badge on placeholder media. Turn off for production. */
  showTodoBadges: boolean;
}

export const DW_DEFAULT_CONFIG: DroneWalkthroughConfig = {
  assetBase: 'assets/drone-walkthrough/',
  showTodoBadges: true,
};

export const DW_CONFIG = new InjectionToken<DroneWalkthroughConfig>('DW_CONFIG', {
  providedIn: 'root',
  factory: () => DW_DEFAULT_CONFIG,
});

/** Register in app.config.ts: providers: [provideDroneWalkthrough({ showTodoBadges: false })]. */
export function provideDroneWalkthrough(config: Partial<DroneWalkthroughConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: DW_CONFIG, useValue: { ...DW_DEFAULT_CONFIG, ...config } }]);
}

/** Resolve a content path: absolute URLs, data: URIs and root paths pass through; others get the asset base. */
export function resolveAsset(base: string, path: string | undefined | null): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:|\/)/.test(path)) return path;
  return base.replace(/\/?$/, '/') + path;
}

@Pipe({ name: 'dwAsset' })
export class DwAssetPipe implements PipeTransform {
  private readonly base = inject(DW_CONFIG).assetBase;
  transform(path: string | undefined | null): string {
    return resolveAsset(this.base, path);
  }
}
