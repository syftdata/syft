import {DependencyInfo, MetricsDependencyRegistry} from "../src/metrics_dependency_registry";
import { TestingPlugin, TestingPlugin2 } from "../src";

describe('MetricsDependencyRegistry', () => {
  beforeAll(() => {
    // Reset the dependency maps before all tests
    MetricsDependencyRegistry.dependencyMap = new Map<string, DependencyInfo>();
  });

  it('should register dependencies correctly', () => {
    new TestingPlugin();
    new TestingPlugin2();

    const expectedPackageMap = new Map<string, DependencyInfo>([
      ['TestingPlugin', new DependencyInfo('TestingPlugin', 'testing-plugin')],
      ['TestingPlugin2', new DependencyInfo('TestingPlugin2', 'testing-plugin2')],
    ]);
    const actualPackageMap = MetricsDependencyRegistry.getPackageMap();
    expect(actualPackageMap.size).toBe(expectedPackageMap.size);
    for (let [key, value] of expectedPackageMap) {
      expect(actualPackageMap.get(key)).toEqual(value);
    }

    const expectedDepMap = new Map<string, DependencyInfo>([
      ['testing-plugin', new DependencyInfo('TestingPlugin', 'testing-plugin')],
      ['testing-plugin2', new DependencyInfo('TestingPlugin2', 'testing-plugin2')],
    ]);
    const actualDepMap = MetricsDependencyRegistry.getDependencyMap();
    expect(actualDepMap.size).toBe(expectedDepMap.size);
    for (let [key, value] of expectedDepMap) {
      expect(actualDepMap.get(key)).toEqual(value);
    }
  });
});
