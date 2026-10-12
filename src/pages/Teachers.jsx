import { useMemo } from "react";
import CrudPage from "../components/CrudPage.jsx";
import { departmentsApi, teachersApi } from "../api.js";
import { byId, useLookup } from "../hooks.js";

export const POSITIONS = [
  { value: "professor", label: "професор" },
  { value: "associate_professor", label: "доцент" },
  { value: "senior_lecturer", label: "старший викладач" },
  { value: "assistant", label: "асистент" },
];
const positionLabel = Object.fromEntries(POSITIONS.map((p) => [p.value, p.label]));

const emptyForm = { first_name: "", last_name: "", position: "", email: "", department: "" };

const toPayload = (f) => ({
  first_name: f.first_name.trim(),
  last_name: f.last_name.trim(),
  position: f.position,
  email: f.email.trim(),
  department: f.department === "" ? null : Number(f.department),
});

const fromItem = (t) => ({
  first_name: t.first_name ?? "",
  last_name: t.last_name ?? "",
  position: t.position ?? "",
  email: t.email ?? "",
  department: t.department == null ? "" : String(t.department),
});

export default function Teachers() {
  const departments = useLookup(departmentsApi.list);
  const deptById = useMemo(() => byId(departments.items), [departments.items]);

  const fields = [
    { name: "last_name", label: "Прізвище", required: true, placeholder: "Коваленко" },
    { name: "first_name", label: "Ім'я", required: true, placeholder: "Олена" },
    { name: "position", label: "Посада", type: "select", required: true, options: POSITIONS },
    {
      name: "department",
      label: "Кафедра",
      type: "select",
      required: true,
      options: departments.items.map((d) => ({ value: String(d.id), label: d.name })),
    },
    { name: "email", label: "Email", type: "email", placeholder: "o.kovalenko@ukma.edu.ua", full: true },
  ];

  const columns = [
    { label: "Викладач", render: (t) => <strong>{`${t.last_name} ${t.first_name}`}</strong> },
    { label: "Посада", render: (t) => positionLabel[t.position] ?? t.position },
    {
      label: "Кафедра",
      render: (t) => deptById[t.department]?.name ?? <span className="muted">id {String(t.department)}</span>,
    },
    { label: "Email", render: (t) => (t.email ? <a href={`mailto:${t.email}`}>{t.email}</a> : <span className="muted">—</span>) },
  ];

  const notice = departments.error ? (
    <div className="alert alert-error">Не вдалося завантажити кафедри: {departments.error}</div>
  ) : null;

  return (
    <CrudPage
      title="Викладачі"
      intro="Викладачі факультету та їхні кафедри."
      api={teachersApi}
      fields={fields}
      emptyForm={emptyForm}
      toPayload={toPayload}
      fromItem={fromItem}
      columns={columns}
      itemLabel={(t) => `${t.last_name} ${t.first_name}`}
      nounAccusative="викладача"
      notice={notice}
    />
  );
}
