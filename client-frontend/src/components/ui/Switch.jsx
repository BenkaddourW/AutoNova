import { useState } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';

const Switch = ({ label, description, defaultChecked = false }) => {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <HeadlessSwitch.Group as="div" className="flex items-center justify-between">
      <span className="flex-grow flex flex-col">
        <HeadlessSwitch.Label as="span" className="label-style" passive>
          {label}
        </HeadlessSwitch.Label>
        <HeadlessSwitch.Description as="span" className="text-sm text-slate-500 dark:text-slate-400">
          {description}
        </HeadlessSwitch.Description>
      </span>
      <HeadlessSwitch
        checked={enabled}
        onChange={setEnabled}
        className={`
          ${enabled ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-600'}
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
          focus-visible:ring-white/75
        `}
      >
        <span
          aria-hidden="true"
          className={`
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0
            transition duration-200 ease-in-out
          `}
        />
      </HeadlessSwitch>
    </HeadlessSwitch.Group>
  );
};

export default Switch;
