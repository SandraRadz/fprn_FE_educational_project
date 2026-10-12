import { useEffect, useState } from "react";
import { subscribeLastResponse } from "../api.js";

// Панель «Відповідь сервера»: метод, адреса, статус і хедери останньої відповіді,
// які доступні JavaScript у браузері.
export default function ResponsePanel() {
  const [info, setInfo] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => subscribeLastResponse(setInfo), []);

  const statusClass =
    info?.status == null ? "st-err" : info.status < 300 ? "st-ok" : info.status < 500 ? "st-warn" : "st-err";

  return (
    <aside className={`response-panel${open ? " open" : ""}`}>
      <button type="button" className="response-toggle" onClick={() => setOpen((o) => !o)}>
        <span>Відповідь сервера</span>
        {info ? (
          <span className="response-summary">
            <span className="method">{info.method}</span>
            <span className={`status ${statusClass}`}>{info.status ?? "—"}</span>
          </span>
        ) : (
          <span className="response-summary muted">запитів ще не було</span>
        )}
        <span className="chevron">{open ? "▾" : "▴"}</span>
      </button>

      {open && (
        <div className="response-body">
          {!info ? (
            <p className="muted">Виконайте будь-яку дію на сторінці.</p>
          ) : (
            <>
              <p className="response-line">
                <span className="method">{info.method}</span> <code>{info.url}</code>
              </p>
              <p className="response-line">
                Статус:{" "}
                <span className={`status ${statusClass}`}>
                  {info.status ?? "немає відповіді"} {info.statusText}
                </span>
                <span className="muted"> · {info.at.toLocaleTimeString("uk-UA")}</span>
              </p>
              <h4>Хедери, доступні JavaScript</h4>
              {info.headers.length ? (
                <table className="headers-table">
                  <tbody>
                    {info.headers.map(([k, v]) => (
                      <tr key={k}>
                        <th>{k}</th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted">Немає.</p>
              )}
              <h4>Тіло</h4>
              <pre>{info.body === null ? "(порожнє)" : JSON.stringify(info.body, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
