import {
  type ISyftPlugin,
  SyftEventType,
  type SyftEvent,
  SyftCustomPlugin
} from '../../src/index';

Object.defineProperty(window, 'localStorage', { value: global.localStorage });

describe('custom plugin', () => {
  const mockUploader = jest.fn((events: SyftEvent[]) => {
    return Promise.resolve();
  });
  afterEach(() => {
    mockUploader.mockClear();
  });

  it('calls upload immediately when batch size is 1', () => {
    const plugin: ISyftPlugin = new SyftCustomPlugin(
      mockUploader,
      'userId',
      'aid',
      1
    );

    plugin.logEvent({
      syft: { eventName: 'test', eventType: SyftEventType.TRACK, isValid: true }
    });
    expect(mockUploader).toBeCalledTimes(1);
  });

  it('calls upload when queue meets batch size', () => {
    const plugin: ISyftPlugin = new SyftCustomPlugin(
      mockUploader,
      'userId',
      'aid',
      2
    );
    plugin.logEvent({
      syft: { eventName: 'test', eventType: SyftEventType.TRACK, isValid: true }
    });
    expect(mockUploader).not.toBeCalled();
    plugin.logEvent({
      syft: {
        eventName: 'test2',
        eventType: SyftEventType.TRACK,
        isValid: true
      }
    });
    expect(mockUploader).toBeCalledTimes(1);
    expect(mockUploader.mock.calls[0][0].length).toBe(2);
  });

  it('calls upload when event becomes older', () => {
    jest.useFakeTimers();
    const plugin: ISyftPlugin = new SyftCustomPlugin(
      mockUploader,
      'userId',
      'aid',
      2,
      100
    );
    plugin.logEvent({
      syft: { eventName: 'test', eventType: SyftEventType.TRACK, isValid: true }
    });
    expect(mockUploader).not.toBeCalled();
    jest.advanceTimersByTime(100);
    expect(mockUploader).toBeCalledTimes(1);
    jest.useRealTimers();
  });
});

describe('custom plugin retry', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  it('retries for specified number of times', async () => {
    const mockUploader = jest.fn().mockReturnValue(Promise.reject());
    const plugin = new SyftCustomPlugin(
      mockUploader,
      'userId',
      'aid',
      1,
      100,
      3
    );
    plugin.logEvent({
      syft: { eventName: 'test', eventType: SyftEventType.TRACK, isValid: true }
    });
    while (jest.getTimerCount() > 0) {
      jest.advanceTimersByTime(1000);
      jest.runAllTimers();
    }
    jest.useRealTimers();
    await new Promise(process.nextTick);
    expect(mockUploader).toBeCalledTimes(4);
  });
  it('retries until it succeeds', async () => {
    const mockUploader = jest
      .fn()
      .mockReturnValueOnce(Promise.reject())
      .mockReturnValueOnce(Promise.resolve());
    const plugin = new SyftCustomPlugin(
      mockUploader,
      'userId',
      'aid',
      1,
      100,
      3
    );
    plugin.logEvent({
      syft: { eventName: 'test', eventType: SyftEventType.TRACK, isValid: true }
    });
    while (jest.getTimerCount() > 0) {
      jest.advanceTimersByTime(1000);
      jest.runAllTimers();
    }
    jest.useRealTimers();
    await new Promise(process.nextTick);
    expect(mockUploader).toBeCalledTimes(2);
  });
});

describe('custom plugin user properties', () => {
  it('identity is persisted to local storage', async () => {
    const mockUploader = jest.fn().mockReturnValue(Promise.resolve());
    const plugin = new SyftCustomPlugin(mockUploader);
    plugin.init();
    plugin.logEvent({
      syft: {
        eventName: 'test',
        eventType: SyftEventType.IDENTIFY,
        isValid: true
      },
      userId: 'abc',
      company: 'acme'
    });
    expect(plugin.userId).toBe('abc');
    expect(plugin.userProperties.company).toBe('acme');
    const plugin2 = new SyftCustomPlugin(mockUploader);
    plugin2.init();
    expect(plugin2.userId).toBe('abc');
    expect(plugin2.userProperties.company).toBe('acme');
  });
  it('identity is attached to other events', async () => {
    const mockUploader = jest.fn().mockReturnValue(Promise.resolve());
    const plugin = new SyftCustomPlugin(mockUploader, 'userId', 'aid', 1);
    plugin.init();
    plugin.logEvent({
      syft: {
        eventName: 'test',
        eventType: SyftEventType.IDENTIFY,
        isValid: true
      },
      userId: 'abc',
      company: 'acme'
    });

    plugin.logEvent({
      syft: {
        eventName: 'test2',
        eventType: SyftEventType.TRACK,
        isValid: true
      }
    });
    expect(mockUploader).toBeCalledTimes(1);
    expect(mockUploader.mock.calls[0][0][0].syft.eventName).toBe('test2');
    expect(mockUploader.mock.calls[0][0][0].userId).toBe('abc');
  });
});
