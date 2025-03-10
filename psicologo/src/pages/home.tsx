import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import axios from "axios";
import ptBR from "@fullcalendar/core/locales/pt-br";
import Modal from "react-modal";
import ProntuarioModal from "../components/ProntuarioModal";
import "../styles/Calendar.module.css";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [appointmentsOfDay, setAppointmentsOfDay] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showProntuario, setShowProntuario] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState("");
  const calendarRef = useRef(null);

  // Atualiza eventos com base na largura da tela
  const generateEvents = async (isMobile) => {
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/appointments"),
        axios.get("http://localhost:5000/api/patients"),
      ]);

      const groupedAppointments = appointmentsRes.data.reduce((acc, appt) => {
        const dateKey = appt.date.split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(appt);
        return acc;
      }, {});

      const appointmentEvents = Object.keys(groupedAppointments).map(
        (date) => ({
          title: isMobile ? "Cons." : "🗓️ Consulta",
          date,
          extendedProps: {
            type: "Consulta",
            appointments: groupedAppointments[date],
          },
          color: "#007bff",
        })
      );

      const birthdayEvents = patientsRes.data
        .filter((p) => p.birthdate)
        .map((p) => {
          const birthDate = new Date(p.birthdate);
          const todayYear = new Date().getFullYear();
          const formattedDate = `${todayYear}-${String(
            birthDate.getMonth() + 1
          ).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`;

          return {
            title: isMobile ? "🎉" : "🎉 Aniversário",
            date: formattedDate,
            extendedProps: {
              type: "Aniversário",
              patient: p,
            },
            color: "#28a745",
          };
        });

      setEvents([...appointmentEvents, ...birthdayEvents]);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      generateEvents(isMobile);
    };

    handleResize(); // Chama na montagem
    window.addEventListener("resize", handleResize); // Atualiza ao redimensionar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEventClick = (info) => {
    const { extendedProps } = info.event;

    if (extendedProps.type === "Consulta") {
      const sorted = extendedProps.appointments.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setAppointmentsOfDay(sorted);
    }

    setSelectedEvent(info.event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setAppointmentsOfDay([]);
  };

  const handleSendBirthday = (patient) => {
    const message = encodeURIComponent(
      `Olá ${patient.name}, parabéns pelo seu aniversário! Que o seu dia seja repleto de alegrias, saúde e muito sucesso.`
    );
    window.open(
      `https://wa.me/${patient.phone.replace(/\D/g, "")}?text=${message}`,
      "_blank"
    );
  };

  const openProntuario = (patient) => {
    setSelectedPatient(patient);
    setShowProntuario(true);
  };

  const closeProntuario = () => {
    setShowProntuario(false);
    setSelectedPatient(null);
  };

  const handleCalendarNav = (action) => {
    const calendarApi = calendarRef.current.getApi();
    if (action === "prev") calendarApi.prev();
    else if (action === "next") calendarApi.next();
    else if (action === "today") calendarApi.today();
    setCalendarTitle(calendarApi.view.title);
  };

  return (
    <div className="container-fluid px-2 mt-3">
      <div className="mb-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
        <h4 className="text-center">{calendarTitle}</h4>
        <div className="d-flex gap-2 justify-content-center mt-2 mt-md-0">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => handleCalendarNav("prev")}
          >
            ← Anterior
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handleCalendarNav("today")}
          >
            Hoje
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => handleCalendarNav("next")}
          >
            Próximo →
          </button>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          locale={ptBR}
          events={events}
          height="auto"
          aspectRatio={1.15}
          dayMaxEventRows={3}
          eventClick={handleEventClick}
          headerToolbar={false}
          ref={calendarRef}
          datesSet={(arg) => setCalendarTitle(arg.view.title)}
        />
      </div>

      <Modal
        isOpen={!!selectedEvent}
        onRequestClose={handleCloseModal}
        className="modal-content-custom"
        overlayClassName="modal-overlay-custom"
      >
        <button onClick={handleCloseModal} className="close-button">
          ×
        </button>

        {selectedEvent?.extendedProps?.type === "Consulta" && (
          <>
            <h4>🗓️ Consultas do dia</h4>
            {appointmentsOfDay.length === 0 ? (
              <p>Nenhuma consulta encontrada.</p>
            ) : (
              <ul className="consultas-lista p-0">
                {appointmentsOfDay.map((appt) => (
                  <li key={appt.id} className="consulta-item">
                    <div>
                      <strong>
                        {new Date(appt.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>{" "}
                      - {appt.patient?.name || "Paciente"}
                    </div>
                    <button
                      className="btn btn-sm btn-link text-white mt-2 mt-md-0"
                      title="Ver prontuário"
                      onClick={() => openProntuario(appt.patient)}
                    >
                      📋 Prontuário
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {selectedEvent?.extendedProps?.type === "Aniversário" && (
          <>
            <h4>🎉 Aniversário</h4>
            <p>
              <strong>Paciente:</strong>{" "}
              {selectedEvent.extendedProps.patient.name}
            </p>
            <button
              className="btn btn-success"
              onClick={() =>
                handleSendBirthday(selectedEvent.extendedProps.patient)
              }
            >
              Enviar Parabéns pelo WhatsApp
            </button>
          </>
        )}
      </Modal>

      {showProntuario && selectedPatient && (
        <ProntuarioModal
          isOpen={showProntuario}
          onRequestClose={closeProntuario}
          patient={selectedPatient}
        />
      )}
    </div>
  );
};

export default Home;
