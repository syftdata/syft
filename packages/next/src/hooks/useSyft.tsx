import { useContext } from 'react';
import type AutoTracker from '../common/tracker';
import { type EventTypes } from '../common/event_types';
import { SyftContext } from '../components/SyftProvider';

export const useSyft = <E extends EventTypes>(): AutoTracker<E> => {
  const result = useContext(SyftContext);
  if (result == null) {
    throw new Error('Context used outside of its Provider!');
  }
  return result as AutoTracker<E>;
};

export const withSyft = <E extends EventTypes>(
  Component: React.ComponentType<{ syft: AutoTracker<E> }>
): React.ComponentType => {
  const WithSyft = (props: any): JSX.Element => {
    const syft = useSyft<E>();
    return <Component {...props} syft={syft} />;
  };
  WithSyft.displayName = `withSyft(${Component.displayName ?? Component.name})`;
  return WithSyft;
};
