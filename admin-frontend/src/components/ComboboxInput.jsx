import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';

const ComboboxInput = ({ value, onChange, options }) => {
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.toLowerCase().includes(query.toLowerCase())
        );
        
  const aNewOption = query.length > 0 && !filteredOptions.some(opt => opt.toLowerCase() === query.toLowerCase());

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-300 sm:text-sm border border-slate-300 dark:border-slate-600">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-100 bg-transparent focus:ring-0"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(option) => option}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
          {/* Option pour ajouter un nouvel élément */}
          {aNewOption && (
            <Combobox.Option
              value={query}
              className={({ active }) => `relative cursor-default select-none py-2 px-4 ${
                  active ? 'bg-sky-600 text-white' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              Ajouter "{query}"
            </Combobox.Option>
          )}

          {filteredOptions.map((option) => (
            <Combobox.Option
              key={option}
              value={option}
              className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-sky-600 text-white' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {({ selected, active }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {option}
                  </span>
                  {selected && (
                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                        active ? 'text-white' : 'text-sky-600'
                    }`}>
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export default ComboboxInput;