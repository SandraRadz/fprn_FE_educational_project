// Усі звернення до бекенду проходять через цей файл.
// Специфікація ендпоінтів — у README_BE.md бекенду.

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

// ---- Остання відповідь сервера (для панелі внизу сторінки) ----
let lastResponse = null;
const listeners = new Set();

export function subscribeLastResponse(fn) {
  listeners.add(fn);
  fn(lastResponse);
  return () => listeners.delete(fn);
}

function publish(info) {
  lastResponse = info;
  listeners.forEach((fn) => fn(info));
}

// ---- Помилка API з розібраним тілом ----
export class ApiError extends Error {
  constructor(status, body, message) {
    super(message);
    this.status = status;
    this.body = body;
    // { field: ["msg", ...] } для 400
    this.fieldErrors = status === 400 && body && typeof body === "object" && !Array.isArray(body) ? body : null;
  }
}

async function request(method, path, data) {
  const url = `${API_URL}${path}`;
  const options = { method, headers: { Accept: "application/json" } };
  if (data !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    publish({ method, url, status: null, statusText: "Network error", headers: [], body: null, at: new Date() });
    throw new ApiError(
      0,
      null,
      "Не вдалося отримати відповідь від сервера. Перевірте, що бекенд запущений на " +
        API_URL +
        " і що він дозволяє запити з цього сайту (CORS). Подробиці — у консолі браузера."
    );
  }

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  publish({
    method,
    url,
    status: response.status,
    statusText: response.statusText,
    headers: [...response.headers.entries()],
    body,
    at: new Date(),
  });

  if (!response.ok) {
    let message;
    if (response.status === 400) message = "Дані не пройшли перевірку на сервері.";
    else if (response.status === 404) message = "Об'єкт не знайдено (404). Можливо, його вже видалили.";
    else if (body && typeof body === "object" && body.detail) message = body.detail;
    else message = `Сервер повернув помилку ${response.status} ${response.statusText}`.trim();
    throw new ApiError(response.status, body, message);
  }

  return body;
}

// ---- Ресурси ----
function resource(name) {
  return {
    list: () => request("GET", `/api/${name}/`),
    create: (data) => request("POST", `/api/${name}/`, data),
    update: (id, data) => request("PUT", `/api/${name}/${id}/`, data),
    remove: (id) => request("DELETE", `/api/${name}/${id}/`),
  };
}

export const departmentsApi = resource("departments");
export const teachersApi = resource("teachers");
export const coursesApi = resource("courses");
