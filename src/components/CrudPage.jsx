import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Універсальна сторінка зі списком і формою: створення, редагування, видалення.
 *
 * props:
 *  - title, intro         заголовок і підзаголовок сторінки
 *  - api                  { list, create, update, remove } з api.js
 *  - fields               опис полів форми
 *  - emptyForm            початкові значення форми
 *  - toPayload(form)      перетворює значення форми у JSON для сервера
 *  - fromItem(item)       перетворює об'єкт із сервера у значення форми
 *  - columns              [{ label, render(item) }] для таблиці
 *  - itemLabel(item)      коротка назва об'єкта (для підтвердження видалення)
 *  - onChanged()          викликається після успішного створення/оновлення/видалення
 *  - notice               додатковий блок над формою (наприклад, «спершу додайте кафедру»)
 */
export default function CrudPage({
  title,
  intro,
  api,
  fields,
  emptyForm,
  toPayload,
  fromItem,
  columns,
  itemLabel,
  onChanged,
  notice,
  nounAccusative,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [flash, setFlash] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const formRef = useRef(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await api.list();
      setItems(Array.isArray(data) ? data : []);
      if (!Array.isArray(data)) setListError("Сервер повернув не масив. Список має бути простим JSON-масивом.");
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  function showFlash(text) {
    setFlash(text);
    window.clearTimeout(showFlash.t);
    showFlash.t = window.setTimeout(() => setFlash(null), 3500);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFieldErrors({});
    setFormError(null);
  }

  function startEdit(item) {
    setForm(fromItem(item));
    setEditingId(item.id);
    setFieldErrors({});
    setFormError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleChange(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((e) => ({ ...e, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError(null);
    try {
      const payload = toPayload(form);
      if (editingId === null) {
        await api.create(payload);
        showFlash("Створено.");
      } else {
        await api.update(editingId, payload);
        showFlash("Зміни збережено.");
      }
      resetForm();
      await loadList();
      onChanged?.();
    } catch (err) {
      if (err.fieldErrors) {
        const known = {};
        const other = [];
        for (const [key, value] of Object.entries(err.fieldErrors)) {
          const messages = Array.isArray(value) ? value.join(" ") : String(value);
          if (fields.some((f) => f.name === key)) known[key] = messages;
          else other.push(key === "non_field_errors" || key === "detail" ? messages : `${key}: ${messages}`);
        }
        setFieldErrors(known);
        setFormError(other.length ? other.join(" ") : err.message);
      } else {
        setFormError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Видалити «${itemLabel(item)}»?`)) return;
    setDeletingId(item.id);
    setListError(null);
    try {
      await api.remove(item.id);
      if (editingId === item.id) resetForm();
      showFlash("Видалено.");
      await loadList();
      onChanged?.();
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>{title}</h1>
        {intro && <p className="lead">{intro}</p>}
      </div>

      {notice}

      <section className="panel" ref={formRef}>
        <div className="panel-head">
          <h2>{editingId === null ? `Додати ${nounAccusative}` : `Редагування (id ${editingId})`}</h2>
          {editingId !== null && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Скасувати
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="form-grid">
          {fields.map((field) => (
            <Field
              key={field.name}
              field={field}
              value={form[field.name]}
              error={fieldErrors[field.name]}
              onChange={(v) => handleChange(field.name, v)}
            />
          ))}

          {formError && <div className="alert alert-error full">{formError}</div>}

          <div className="form-actions full">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Надсилаю…" : editingId === null ? "Створити" : "Зберегти зміни"}
            </button>
            {flash && <span className="flash">{flash}</span>}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>
            Список <span className="count">{items.length}</span>
          </h2>
          <button type="button" className="btn" onClick={loadList} disabled={loading}>
            {loading ? "Завантажую…" : "Отримати список"}
          </button>
        </div>

        {listError && <div className="alert alert-error">{listError}</div>}

        {!loading && !listError && items.length === 0 && <p className="empty">Поки що нічого немає.</p>}

        {items.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="col-id">id</th>
                  {columns.map((c) => (
                    <th key={c.label}>{c.label}</th>
                  ))}
                  <th className="col-actions" aria-label="Дії" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={editingId === item.id ? "row-editing" : undefined}>
                    <td className="col-id">{item.id}</td>
                    {columns.map((c) => (
                      <td key={c.label} data-label={c.label}>
                        {c.render(item)}
                      </td>
                    ))}
                    <td className="col-actions">
                      <button type="button" className="btn btn-small" onClick={() => startEdit(item)}>
                        Редагувати
                      </button>
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? "…" : "Видалити"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Field({ field, value, error, onChange }) {
  const id = `f-${field.name}`;
  const common = {
    id,
    value: value ?? "",
    onChange: (e) => onChange(e.target.value),
    "aria-invalid": error ? "true" : undefined,
  };

  let control;
  if (field.type === "textarea") {
    control = <textarea rows={3} placeholder={field.placeholder} {...common} />;
  } else if (field.type === "select") {
    control = (
      <select {...common}>
        <option value="">{field.emptyOption ?? "— оберіть —"}</option>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else {
    control = (
      <input
        type={field.type || "text"}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        {...common}
      />
    );
  }

  return (
    <div className={`field${field.full ? " full" : ""}${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {field.required && <span className="req"> *</span>}
      </label>
      {control}
      {field.hint && !error && <small className="hint">{field.hint}</small>}
      {error && <small className="error">{error}</small>}
    </div>
  );
}
