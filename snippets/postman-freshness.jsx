export const PostmanFreshness = ({ iso, lang = "es" }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ts = new Date(iso).getTime();
  if (!iso || Number.isNaN(ts)) {
    return null;
  }
  const secs = Math.max(0, Math.floor((now - ts) / 1000));
  const units =
    lang === "en"
      ? [
          [31536000, "year", "years"],
          [2592000, "month", "months"],
          [86400, "day", "days"],
          [3600, "hour", "hours"],
          [60, "minute", "minutes"],
          [1, "second", "seconds"],
        ]
      : [
          [31536000, "año", "años"],
          [2592000, "mes", "meses"],
          [86400, "día", "días"],
          [3600, "hora", "horas"],
          [60, "minuto", "minutos"],
          [1, "segundo", "segundos"],
        ];
  let rel = lang === "en" ? "0 seconds ago" : "hace 0 segundos";
  for (const [size, one, many] of units) {
    if (secs >= size || size === 1) {
      const n = Math.floor(secs / size);
      const unit = n === 1 ? one : many;
      rel = lang === "en" ? `${n} ${unit} ago` : `hace ${n} ${unit}`;
      break;
    }
  }
  const label = lang === "en" ? `Updated ${rel}` : `Actualizada ${rel}`;
  return (
    <p className="text-sm text-gray-500 dark:text-zinc-400">
      <strong>{label}</strong>
    </p>
  );
};
