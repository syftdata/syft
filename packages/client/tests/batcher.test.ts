import { type IReflector } from '../src';
import Batcher from '../src/batcher';
import {
  type ISyftPlugin,
  SyftEventType,
  type FullConfig,
  DEFAULT_RUNTIME_CONFIG,
  DEFAULT_MONITOR_CONFIG,
  DEFAULT_STATIC_CONFIG,
  NamingCase,
  type SyftEvent
} from '../src/index';

interface TestEvent extends SyftEvent {
  prop1: string;
  Prop2: string;
  prop_3: string;
  Prop_4: string;
  Prop_Hi: string;
}

function getMockPlugin(id: string): ISyftPlugin {
  return {
    pkg: "",
    id,
    init: jest.fn(() => {}),
    logEvent: jest.fn(() => {
      return true;
    }),
    resetUserProperties: jest.fn(() => {}),
    isLoaded: () => true
  };
}

const plugin: ISyftPlugin = getMockPlugin('mock');
const mockReflector: IReflector = {
  reflectEvent: jest.fn(() => {})
};

const config: FullConfig = {
  ...DEFAULT_STATIC_CONFIG,
  ...DEFAULT_RUNTIME_CONFIG,
  monitor: {
    ...DEFAULT_MONITOR_CONFIG
  },
  plugins: [plugin]
};

afterEach(() => {
  (plugin.logEvent as jest.Mock).mockClear();
});

describe('batcher', () => {
  it('calls plugin when an event is enqueued', async () => {
    const batcher = new Batcher(config);
    batcher.loadPlugins(mockReflector);

    batcher.logEvent({
      syft: { eventName: 'test', eventType: SyftEventType.TRACK, isValid: true }
    });
    await batcher.pluginLoader.onLoad().then(() => {
      expect(plugin.logEvent as jest.Mock).toBeCalledTimes(1);
    });
  });

  it('stops call chain if a plugin returns false', async () => {
    (plugin.logEvent as jest.Mock).mockReturnValue(false);
    const plugin2: ISyftPlugin = getMockPlugin('mock2');
    config.plugins.push(plugin2);
    const batcher = new Batcher(config);
    batcher.loadPlugins(mockReflector);

    batcher.logEvent({
      syft: { eventName: 'test', eventType: SyftEventType.TRACK, isValid: true }
    });

    await batcher.pluginLoader.onLoad().then(() => {
      expect(plugin.logEvent as jest.Mock).toBeCalledTimes(1);
      expect(plugin2.logEvent as jest.Mock).toBeCalledTimes(0);
    });
  });
});

describe('batcher naming', () => {
  it('applies event and property naming conventions', async () => {
    config.eventNameCase = NamingCase.PASCAL;
    config.propertyNameCase = NamingCase.SNAKE;
    const batcher = new Batcher(config);
    batcher.loadPlugins(mockReflector);

    const testEvent: TestEvent = {
      syft: {
        eventName: 'test event',
        eventType: SyftEventType.TRACK,
        isValid: true
      },
      prop1: 'hi',
      Prop2: 'hi',
      prop_3: 'hi',
      Prop_4: 'hi',
      Prop_Hi: 'hi'
    };
    batcher.logEvent(testEvent);

    await batcher.pluginLoader.onLoad().then(() => {
      expect(plugin.logEvent as jest.Mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          syft: {
            eventName: 'TestEvent',
            eventType: 0,
            isValid: true
          },
          prop_1: 'hi',
          prop_2: 'hi',
          prop_3: 'hi',
          prop_4: 'hi',
          prop_hi: 'hi'
        })
      );
    });
  });
});
