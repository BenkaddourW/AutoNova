import { useState, useEffect } from 'react';

/**
 * Un hook qui retarde la mise à jour d'une valeur.
 * @param {*} value La valeur à "débouncer".
 * @param {number} delay Le délai en millisecondes.
 * @returns La valeur "débouncée".
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Met en place un minuteur pour mettre à jour la valeur après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annule le minuteur si la valeur change avant la fin du délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Ne se ré-exécute que si la valeur ou le délai change

  return debouncedValue;
}
