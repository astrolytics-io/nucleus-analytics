import { useState } from 'react';
import Nucleus from 'nucleus-analytics';
import toast, { Toaster } from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/tauri';
import reactLogo from './assets/react.svg';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke('greet', { name }));
  }

  const [trackingEnabled, setTrackingEnabled] = useState(true);

  const actions = [
    {
      key: 'click',
      label: 'Track click',
      action: () => {
        if (trackingEnabled) {
          Nucleus.track('click');
          toast('Click tracked!');
        }
      },
    },
    {
      key: 'page',
      label: 'Track pageview',
      action: () => {
        if (trackingEnabled) {
          Nucleus.page('/about', { foo: 'bar' });
          toast('Pageview tracked!');
        }
      },
    },
    {
      key: 'identify',
      label: 'Identify user',
      action: () => {
        if (trackingEnabled) {
          Nucleus.identify('user-id', { email: 'email@example.com' });
          toast('User identified!');
        }
      },
    },
    {
      key: 'disable',
      label: trackingEnabled ? 'Disable tracking' : 'Enable tracking',
      action: () => {
        if (trackingEnabled) {
          Nucleus.disableTracking();
          setTrackingEnabled(false);
          toast('Tracking disabled!');
        } else {
          Nucleus.enableTracking();
          setTrackingEnabled(true);
          toast('Tracking enabled!');
        }
      },
    },
  ];

  return (
    <div className="py-24 text-white bg-stone-900 flex flex-col items-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome to Tauri!</h1>

      <div className="mt-20 flex flex-row items-center gap-x-4">
        <a
          href="https://vitejs.dev"
          target="_blank"
        >
          <img src="/vite.svg" className="w-24 h-24" alt="Vite logo" />
        </a>
        <a
          href="https://tauri.app"
          target="_blank"
        >
          <img src="/tauri.svg" className="w-24 h-24" alt="Tauri logo" />
        </a>
        <a
          href="https://reactjs.org"
          target="_blank"
        >
          <img src={reactLogo} className="w-24 h-24" alt="React logo" />
        </a>
      </div>

      <p className="text-xl mt-20">Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="flex flex-row items-center gap-x-4 mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
          className="px-4 py-2 rounded-md bg-stone-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-stone-800 text-white border border-transparent
                     hover:border-blue-700"
        >
          Greet
        </button>
      </form>

      <p className="mt-4">{greetMsg}</p>
      <div className="mt-12 self-center grid grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={action.action}
            className="px-4 py-2 rounded-md bg-stone-800 text-white border border-transparent
                      ring-1 ring-transparent hover:ring-blue-700 transition-all duration-150"
          >
            {action.label}
          </button>
        ))}
      </div>
      <Toaster />
    </div>
  );
}

export default App;
