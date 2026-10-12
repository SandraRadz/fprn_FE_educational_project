import CrudPage from "../components/CrudPage.jsx";
import { departmentsApi } from "../api.js";

const fields = [
  { name: "name", label: "Назва", required: true, placeholder: "Кафедра біології", full: true },
  { name: "email", label: "Email", type: "email", placeholder: "biology@ukma.edu.ua" },
  { name: "description", label: "Опис", type: "textarea", full: true },
];

const emptyForm = { name: "", email: "", description: "" };

const toPayload = (f) => ({
  name: f.name.trim(),
  description: f.description.trim(),
  email: f.email.trim(),
});

const fromItem = (d) => ({
  name: d.name ?? "",
  description: d.description ?? "",
  email: d.email ?? "",
});

const columns = [
  { label: "Назва", render: (d) => <strong>{d.name}</strong> },
  { label: "Email", render: (d) => (d.email ? <a href={`mailto:${d.email}`}>{d.email}</a> : <span className="muted">—</span>) },
  { label: "Опис", render: (d) => d.description || <span className="muted">—</span> },
];

export default function Departments() {
  return (
    <CrudPage
      title="Кафедри"
      intro="Структурні підрозділи факультету. Кафедру, до якої прив'язані викладачі або курси, видалити не можна."
      api={departmentsApi}
      fields={fields}
      emptyForm={emptyForm}
      toPayload={toPayload}
      fromItem={fromItem}
      columns={columns}
      itemLabel={(d) => d.name}
      nounAccusative="кафедру"
    />
  );
}
