import { useMemo } from "react";
import CrudPage from "../components/CrudPage.jsx";
import { coursesApi, departmentsApi, teachersApi } from "../api.js";
import { byId, useLookup } from "../hooks.js";

const emptyForm = { title: "", credits: "", department: "", teacher: "", description: "" };

const toPayload = (f) => ({
  title: f.title.trim(),
  description: f.description.trim(),
  credits: f.credits === "" ? null : Number(f.credits),
  department: f.department === "" ? null : Number(f.department),
  teacher: f.teacher === "" ? null : Number(f.teacher),
});

const fromItem = (c) => ({
  title: c.title ?? "",
  description: c.description ?? "",
  credits: c.credits == null ? "" : String(c.credits),
  department: c.department == null ? "" : String(c.department),
  teacher: c.teacher == null ? "" : String(c.teacher),
});

export default function Courses() {
  const departments = useLookup(departmentsApi.list);
  const teachers = useLookup(teachersApi.list);
  const deptById = useMemo(() => byId(departments.items), [departments.items]);
  const teacherById = useMemo(() => byId(teachers.items), [teachers.items]);

  const fields = [
    { name: "title", label: "Назва курсу", required: true, placeholder: "Загальна генетика", full: true },
    {
      name: "credits",
      label: "Кредити ЄКТС",
      type: "number",
      required: true,
      min: 1,
      max: 15,
      step: 0.5,
      placeholder: "4",
      hint: "Від 1 до 15, крок 0.5",
    },
    {
      name: "department",
      label: "Кафедра",
      type: "select",
      required: true,
      options: departments.items.map((d) => ({ value: String(d.id), label: d.name })),
    },
    {
      name: "teacher",
      label: "Викладач",
      type: "select",
      emptyOption: "— не призначено —",
      options: teachers.items.map((t) => ({ value: String(t.id), label: `${t.last_name} ${t.first_name}` })),
    },
    { name: "description", label: "Опис", type: "textarea", full: true },
  ];

  const columns = [
    { label: "Курс", render: (c) => <strong>{c.title}</strong> },
    { label: "Кредити", render: (c) => c.credits },
    {
      label: "Кафедра",
      render: (c) => deptById[c.department]?.name ?? <span className="muted">id {String(c.department)}</span>,
    },
    {
      label: "Викладач",
      render: (c) => {
        if (c.teacher == null) return <span className="muted">не призначено</span>;
        const t = teacherById[c.teacher];
        return t ? `${t.last_name} ${t.first_name}` : <span className="muted">id {c.teacher}</span>;
      },
    },
  ];

  const errors = [departments.error && `кафедри: ${departments.error}`, teachers.error && `викладачів: ${teachers.error}`].filter(Boolean);
  const notice = errors.length ? (
    <div className="alert alert-error">Не вдалося завантажити {errors.join("; ")}</div>
  ) : null;

  return (
    <CrudPage
      title="Курси"
      intro="Навчальні дисципліни факультету."
      api={coursesApi}
      fields={fields}
      emptyForm={emptyForm}
      toPayload={toPayload}
      fromItem={fromItem}
      columns={columns}
      itemLabel={(c) => c.title}
      nounAccusative="курс"
      notice={notice}
      onChanged={teachers.reload}
    />
  );
}
