import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import Modal from "react-modal";

const localizer = momentLocalizer(moment);

const CalendarComponent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/appointments"
      );
      const formattedEvents = response.data.map((appointment: any) => ({
        id: appointment.id,
        title: `${appointment.patient.name} - ${appointment.status}`,
        start: new Date(appointment.date),
        end: new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000), // 1h de duração
        patient: appointment.patient,
        value: appointment.value,
        isPaid: appointment.isPaid,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  return (
    <div>
      <h2>Agenda Semanal</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleSelectEvent}
      />

      {/* Modal para exibir detalhes do evento */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h3>Detalhes da Consulta</h3>
        {selectedEvent && (
          <div>
            <p>
              <strong>Paciente:</strong> {selectedEvent.patient.name}
            </p>
            <p>
              <strong>Data:</strong>{" "}
              {moment(selectedEvent.start).format("DD/MM/YYYY HH:mm")}
            </p>
            <p>
              <strong>Status:</strong> {selectedEvent.title.split(" - ")[1]}
            </p>
            <p>
              <strong>Valor:</strong> R$ {selectedEvent.value}
            </p>
            <p>
              <strong>Pagamento:</strong>{" "}
              {selectedEvent.isPaid ? "Pago" : "Pendente"}
            </p>
          </div>
        )}
        <button onClick={() => setModalIsOpen(false)}>Fechar</button>
      </Modal>
    </div>
  );
};

export default CalendarComponent;
