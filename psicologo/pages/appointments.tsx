import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import styles from "../styles/Appointments.module.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/appointments"
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/patients");
      setPatients(response.data);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await axios.put(
          `http://localhost:5000/api/appointments/${editingAppointment.id}`,
          {
            patientId,
            date,
            status,
          }
        );
      } else {
        await axios.post("http://localhost:5000/api/appointments", {
          patientId,
          date,
          status,
        });
      }
      setPatientId("");
      setDate("");
      setStatus("scheduled");
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setPatientId(appointment.patient?.id || "");
    setDate(appointment.date);
    setStatus(appointment.status);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`);
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
    }
  };

  const columns = [
    {
      name: "Paciente",
      selector: (row: any) => row.patient?.name || "Desconhecido",
      sortable: true,
    },
    {
      name: "Telefone",
      selector: (row: any) => row.patient?.phone || "Sem telefone",
    },
    {
      name: "Data",
      selector: (row: any) => new Date(row.date).toLocaleString("pt-BR"),
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
    },
    {
      name: "Ações",
      cell: (row: any) => (
        <div>
          <button className={styles.editButton} onClick={() => handleEdit(row)}>
            Editar
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete(row.id)}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h2>Agendamentos</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
        >
          <option value="">Selecione um Paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="scheduled">Agendado</option>
          <option value="completed">Concluído</option>
          <option value="canceled">Cancelado</option>
        </select>
        <button type="submit">
          {editingAppointment ? "Atualizar" : "Agendar"}
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
  );
};

export default Appointments;
