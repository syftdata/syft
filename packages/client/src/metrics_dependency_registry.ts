/**
 * The following provides functionality to enforce a consistent set of supported metrics dependencies and store them
 * in a map for easy reference. This map can easily be extended to include additional state that may be required in
 * the future like version, etc.
 */

/**
 * maps dependency name like 'Amplitude' to corresponding DependencyInfo
 */
type DependencyMap = Map<string, DependencyInfo>;
/**
 * maps pkg name like 'amplitude-js' to corresponding DependencyInfo
 */
type PackageMap = Map<string, DependencyInfo>;

export class DependencyInfo {
  id: string;
  pkg: string;
  constructor(id: string, pkg: string) {
    this.id = id;
    this.pkg = pkg;
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class MetricsDependencyRegistry {
  static dependencyMap: DependencyMap = new Map<string, DependencyInfo>();

  static packageMap: PackageMap = new Map<string, DependencyInfo>();

  private static registerDependency(id: string, pkg: string): void {
    this.dependencyMap.set(id, new DependencyInfo(id, pkg));
    this.packageMap.set(pkg, new DependencyInfo(id, pkg));
  }

  static getDependencyMap(): DependencyMap {
    return this.dependencyMap;
  }

  static getPackageMap(): PackageMap {
    return this.packageMap;
  }

  static registerDependencies(): void {
    const keys = Object.getOwnPropertyNames(this.prototype);
    for (const key of keys) {
      if (key === 'pkg' || key === 'id') {
        const value = this.prototype[key];
        if (typeof value === 'string') {
          this.registerDependency(value, key);
        }
      }
    }
  }

  protected static register(): void {}
}

interface IMetricsDependency extends MetricsDependencyRegistry {
  pkg: string;
  id: string;
}

/**
 * All Plugins need to extend this. Right now we are extending it via ISyftPlugin.
 */
export abstract class MetricsDependency implements IMetricsDependency {
  pkg!: string;
  id!: string;

  protected static register(): void {
    MetricsDependencyRegistry.registerDependencies.call(this);
  }
}
