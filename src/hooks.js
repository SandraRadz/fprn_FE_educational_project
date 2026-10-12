import { useCallback, useEffect, useState } from "react";

// Завантажує довідник (кафедри, викладачі) для випадних списків і підписів у таблиці.
export function useLookup(listFn) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const data = await listFn();
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [listFn]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, error, reload };
}

export function byId(items) {
  return Object.fromEntries(items.map((i) => [i.id, i]));
}
