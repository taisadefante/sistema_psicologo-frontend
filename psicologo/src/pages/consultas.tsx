import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import styles from "../styles/Consultations.module.css";

Modal.setAppElement("#__next");

const Consulta = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedDescriptions, setEditedDescriptions] = useState({});
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    date: "",
    time: "",
    type: "presencial",
    amount: "",
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Erro ao buscar pacientes:", err);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const { patientId, date, time, type, amount } = form;
      if (!patientId || !date || !time || !amount) {
        alert("Preencha todos os campos!");
        return;
      }
      const fullDate = new Date(`${date}T${time}`);
      const link =
        type === "remoto"
          ? `https://meet.jit.si/${patientId}-${Date.now()}`
          : "";
      await axios.post("http://localhost:5000/api/appointments", {
        patientId,
        date: fullDate,
        type,
        amount,
        link,
      });
      setForm({
        patientId: "",
        date: "",
        time: "",
        type: "presencial",
        amount: "",
      });
      fetchAppointments();
    } catch (err) {
      console.error("Erro ao criar consulta:", err);
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment({
      ...appointment,
      date: new Date(appointment.date).toISOString().slice(0, 16),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAppointment = async () => {
    try {
      const { id, date, type, amount, patientId } = selectedAppointment;
      const link =
        type === "remoto"
          ? `https://meet.jit.si/${patientId}-${Date.now()}`
          : "";
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        patientId,
        date,
        type,
        amount,
        link,
      });
      setIsEditModalOpen(false);
      fetchAppointments();
    } catch (err) {
      console.error("Erro ao atualizar consulta:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      console.error("Erro ao excluir consulta:", err);
    }
  };

  const handleOpenProntuario = (patient) => {
    setSelectedPatient(patient);
    setIsProntuarioOpen(true);
  };

  const handleCloseProntuario = () => {
    setSelectedPatient(null);
    setIsProntuarioOpen(false);
  };

  const columns = [
    {
      name: "Paciente",
      selector: (row) => row.patient?.name || "Desconhecido",
    },
    {
      name: "Data",
      selector: (row) =>
        new Date(row.date).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      name: "Tipo",
      selector: (row) => (row.type === "remoto" ? "Remoto" : "Presencial"),
    },
    {
      name: "Valor",
      selector: (row) => `R$ ${row.amount}`,
    },
    {
      name: "Link",
      cell: (row) =>
        row.type === "remoto" && row.link ? (
          <a href={row.link} target="_blank" rel="noreferrer">
            Acessar
          </a>
        ) : (
          "-"
        ),
    },
    {
      name: "Prontuário",
      center: true,
      cell: (row) => (
        <button
          className={styles.viewButton}
          onClick={() => handleOpenProntuario(row)}
          title="Ver Prontuário"
        >
          📋
        </button>
      ),
    },

    {
      name: "Ações",
      cell: (row) => (
        <div>
          <button className={styles.editButton} onClick={() => handleEdit(row)}>
            <img src="/icon/pen.png" width="20px" />
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete(row.id)}
          >
            <img src="/icon/bin.png" width="20px" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h2 className={styles.title}>Gestão de Consultas</h2>

        <form className={styles.form} onSubmit={handleCreateAppointment}>
          <select
            className={styles.input}
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            required
          >
            <option value="">Selecione o paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            className={styles.input}
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
          <select
            className={styles.input}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
          </select>
          <input
            className={styles.input}
            type="number"
            placeholder="Valor"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <button className={styles.button} type="submit">
            Agendar Consulta
          </button>
        </form>

        <DataTable
          columns={columns}
          data={appointments}
          pagination
          highlightOnHover
          striped
        />
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className={styles.modal}
      >
        {selectedAppointment && (
          <div>
            <h3>Editar Consulta</h3>
            <input
              className={styles.input}
              type="datetime-local"
              value={selectedAppointment.date}
              onChange={(e) =>
                setSelectedAppointment({
                  ...selectedAppointment,
                  date: e.target.value,
                })
              }
            />
            <select
              className={styles.input}
              value={selectedAppointment.type}
              onChange={(e) =>
                setSelectedAppointment({
                  ...selectedAppointment,
                  type: e.target.value,
                })
              }
            >
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
            </select>
            <input
              className={styles.input}
              type="number"
              value={selectedAppointment.amount}
              onChange={(e) =>
                setSelectedAppointment({
                  ...selectedAppointment,
                  amount: e.target.value,
                })
              }
            />
            <button className={styles.button} onClick={handleUpdateAppointment}>
              Atualizar
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Consulta;
