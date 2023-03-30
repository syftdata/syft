import Syft, { SyftEnv } from './syftclient';
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  duration: '5s'
  // stages: [
  //   { duration: '10s', target: 2 },
  //   { duration: '20s', target: 20 }, // ramp up to 20 users over 30 seconds
  //   { duration: '1m', target: 20 }, // stay at 20 for 1 minute
  //   { duration: '10s', target: 0 }
  // ]
};

const POST_URL = 'https://events.syftdata.com/reflect/v1';
//const POST_URL = 'http://localhost:8080/reflect/v1';
const API_KEY = 'clf36x9ij0008mrt23y0o43wx';
const APP_VERSION = '1.0.0';

function createBatchCall(events: any) {
  return {
    apiKey: API_KEY,
    appVersion: APP_VERSION,
    libVersion: '0.0.1',
    env: SyftEnv.Dev,
    events,
    libPlatform: 'web',
    samplingRate: 1.0
  };
}

const syft = new Syft({
  apiKey: 'clf36x9ij0008mrt23y0o43wx',
  appVersion: '1.0.0',
  plugins: [],
  env: SyftEnv.Dev,
  verbose: true,
  monitor: {
    batchSize: 10,
    samplingRate: 1.0, // 100% of the data
    remote: (events) => {
      const payload = JSON.stringify(createBatchCall(events));
      const params = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const res = http.post(POST_URL, payload, params);
      console.log(res.error, res.status, res.body);
      check(res, {
        'status is 200': (r: any) => r.status === 200
      });
      return Promise.resolve(true);
    }
  }
});

export default function () {
  syft.reflectEvent('Account Created', {
    account_id: 'aura',
    account_name: 'Aura',
    email: 'peter@aura.com',
    plan: 'premium'
  });
  // type	String	The type of signup, e.g. invited, organic.
  // first_name	String	The first name of the user.
  // last_name	String	The last name of the user.
  // email	String	The email of the user.
  // phone	String	The phone number of the user.
  // username	String	The username of the user.
  // title	String	The title of the user.
  syft.reflectEvent('Signed Up', {
    type: 'invited',
    first_name: 'Peter',
    last_name: 'Gibbons',
    email: 'peter@aura.com',
    phone: '1234567890',
    username: 'peter',
    title: 'Data Engineer',
    context: {
      groupId: 'aura'
    }
  });

  syft.reflectEvent('Signed In', {
    username: 'peter',
    email: 'peter@aura.com',
    logins: 5,
    context: {
      groupId: 'aura'
    }
  });
  syft.reflectEvent('Signed Out', {
    username: 'peter',
    context: {
      groupId: 'aura'
    }
  });
  syft.reflectEvent('Account Deleted', {
    account_name: 'Aura',
    account_id: 'aura'
  });
  syft.reflectEvent('Invite Sent', {
    username: 'peter',
    invitee_email: 'peter1@aura.com',
    invitee_first_name: 'Peter1',
    invitee_last_name: 'Gibbons',
    invitee_role: 'Member',
    context: {
      groupId: 'aura'
    }
  });
  syft.reflectEvent('Source Created', {
    id: 'aura_backend',
    name: 'backend',
    type: 'SEGMENT'
  });
  syft.reflectEvent('Dashboard Viewed', {
    id: 'aura_backend',
    time_frame: '3h'
  });
  syft.batcher.flush();
}
