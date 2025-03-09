import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ptBR from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "react-modal";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

Modal.setAppElement("#__next");

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    date: "",
    time: "",
    amount: "",
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  // ✅ Buscar lista de agendamentos
  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/appointments"
      );
      const formattedAppointments = response.data.map((appointment) => ({
        id: appointment.id,
        title: `${format(new Date(appointment.date), "HH:mm")} - ${
          appointment.patient?.name.split(" ")[0] || "Paciente"
        }`,
        start: new Date(appointment.date),
        end: new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000), // Duração 1h
        patient: appointment.patient ?? { name: "Paciente Desconhecido" },
        link: appointment.link ?? "",
        history: appointment.patient?.appointments || [],
      }));
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  // ✅ Buscar lista de pacientes
  const fetchPatients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/patients");
      setPatients(response.data);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
    }
  };

  // ✅ Criar um novo agendamento
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const { patientId, date, time, amount } = newAppointment;
      if (!patientId || !date || !time || !amount) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      const fullDate = new Date(`${date}T${time}:00`);
      const generatedLink = `https://meet.jit.si/${patientId}-${Date.now()}`;

      await axios.post("http://localhost:5000/api/appointments", {
        patientId,
        date: fullDate,
        amount,
        link: generatedLink,
      });

      alert("Consulta agendada com sucesso!");
      setNewAppointment({ patientId: "", date: "", time: "", amount: "" });
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao agendar consulta:", error);
      alert("Erro ao agendar consulta.");
    }
  };

  // ✅ Abrir modal ao clicar no evento
  const handleSelectEvent = (event) => {
    setSelectedAppointment(event);
    setIsModalOpen(true);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto" }}>
      <h2>📅 Agenda Consultas</h2>

      {/* ✅ Formulário de agendamento */}
      <form
        onSubmit={handleCreateAppointment}
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "20px",
        }}
      >
        <label>Paciente:</label>
        <select
          value={newAppointment.patientId}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, patientId: e.target.value })
          }
          required
        >
          <option value="">Selecione</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label>Data:</label>
        <input
          type="date"
          value={newAppointment.date}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, date: e.target.value })
          }
          required
        />

        <label>Hora:</label>
        <input
          type="time"
          value={newAppointment.time}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, time: e.target.value })
          }
          required
        />

        <label>Valor (R$):</label>
        <input
          type="number"
          value={newAppointment.amount}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, amount: e.target.value })
          }
          required
        />

        <button type="submit" class="btn btn-primary mt-3">
          Agendar Consulta
        </button>
      </form>

      {/* ✅ Calendário exibindo a agenda semanal */}
      <Calendar
        localizer={localizer}
        events={appointments}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        defaultView="week"
        views={["week"]}
        step={60} // Define os intervalos de tempo de 1 hora
        min={new Date(2025, 0, 1, 8, 0, 0)} // Horário mínimo: 8h
        max={new Date(2025, 0, 1, 22, 0, 0)} // Horário máximo: 22h
        messages={{
          next: "Próximo",
          previous: "Anterior",
          today: "Hoje",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
        }}
        onSelectEvent={handleSelectEvent}
      />

      {/* ✅ Modal com detalhes do agendamento */}
      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <h2>Detalhes do Paciente</h2>
        {selectedAppointment && (
          <div>
            <p>
              <strong>Nome:</strong>{" "}
              {selectedAppointment.patient?.name ?? "Paciente Desconhecido"}
            </p>
            <p>
              <strong>Telefone:</strong>{" "}
              {selectedAppointment.patient?.phone ?? "Não informado"}
            </p>
            <p>
              <strong>Endereço:</strong>{" "}
              {selectedAppointment.patient?.address ?? "Não informado"}
            </p>
            <h3>📋 Histórico de Atendimentos</h3>
            <ul>
              {selectedAppointment.history.map((appt) => (
                <li key={appt.id}>
                  {format(new Date(appt.date), "dd/MM/yyyy HH:mm")}
                </li>
              ))}
            </ul>
            {selectedAppointment.link && (
              <p>
                <strong>Atendimento Remoto:</strong>{" "}
                <a href={selectedAppointment.link} target="_blank">
                  Clique aqui
                </a>
              </p>
            )}
          </div>
        )}
        <button onClick={() => setIsModalOpen(false)}>Fechar</button>
      </Modal>
    </div>
  );
};

export default Appointments;
