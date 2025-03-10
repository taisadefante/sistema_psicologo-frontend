import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import axios from "axios";
import ptBR from "@fullcalendar/core/locales/pt-br";
import Modal from "react-modal";
import ProntuarioModal from "../components/ProntuarioModal";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [appointmentsOfDay, setAppointmentsOfDay] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showProntuario, setShowProntuario] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchCalendarEvents();
    window.addEventListener("resize", fetchCalendarEvents);
    return () => window.removeEventListener("resize", fetchCalendarEvents);
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/appointments"),
        axios.get("http://localhost:5000/api/patients"),
      ]);

      const isMobile = window.innerWidth <= 768;

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
      `Olá ${patient.name}, parabéns pelo seu aniversário!  Que o seu dia seja repleto de alegrias, saúde e muito sucesso.`
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

  return (
    <div className="container-fluid px-2" style={{ marginTop: "10px" }}>
      <div
        style={{
          overflowX: "auto",
          width: "100%",
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
          ref={calendarRef}
        />
      </div>

      <Modal
        isOpen={!!selectedEvent}
        onRequestClose={handleCloseModal}
        style={{
          content: {
            maxWidth: "500px",
            margin: "auto",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#2c3e50",
            color: "white",
            zIndex: 1000,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            maxHeight: "80vh",
            overflowY: "auto",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 999,
          },
        }}
      >
        <button
          onClick={handleCloseModal}
          style={{
            position: "absolute",
            top: 10,
            right: 15,
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {selectedEvent?.extendedProps?.type === "Consulta" && (
          <>
            <h4>🗓️ Consultas do dia</h4>
            {appointmentsOfDay.length === 0 ? (
              <p>Nenhuma consulta encontrada.</p>
            ) : (
              <ul style={{ padding: 0, listStyle: "none" }}>
                {appointmentsOfDay.map((appt) => (
                  <li
                    key={appt.id}
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>
                        {new Date(appt.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                      : {appt.patient?.name || "Paciente"}
                    </div>
                    <button
                      className="btn btn-sm btn-link text-white"
                      title="Ver prontuário"
                      onClick={() => openProntuario(appt.patient)}
                    >
                      📋
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
