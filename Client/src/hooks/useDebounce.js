import { useEffect, useState } from "react";

// Value 500ms tak change na ho tabhi update hoti hai (har key press pe API call nahi)
export default function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
