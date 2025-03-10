import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useRouter } from "next/router";

interface ProntuarioModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  patient: any;
}

const ProntuarioModal: React.FC<ProntuarioModalProps> = ({
  isOpen,
  onRequestClose,
  patient,
}) => {
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [editedDescriptions, setEditedDescriptions] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (patient) {
      fetchAppointments();
      fetchPayments();
    }
  }, [patient]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/patients/${patient.id}/appointments`
      );
      setAppointments(res.data);
      const descriptionsMap: any = {};
      res.data.forEach((appt: any) => {
        descriptionsMap[appt.id] = appt.description || "";
      });
      setEditedDescriptions(descriptionsMap);
    } catch (err) {
      console.error("Erro ao buscar atendimentos:", err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/patients/${patient.id}/payments`
      );
      setPayments(res.data);
    } catch (err) {
      console.error("Erro ao buscar pagamentos:", err);
    }
  };

  const handleSaveDescription = async (id: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${id}/description`,
        {
          description: editedDescriptions[id],
        }
      );
      fetchAppointments();
    } catch (err) {
      console.error("Erro ao salvar descrição:", err);
    }
  };

  const handleClearDescription = async (id: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${id}/description`,
        {
          description: "",
        }
      );
      fetchAppointments();
    } catch (err) {
      console.error("Erro ao limpar descrição:", err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const openAgendamento = () => {
    router.push("/consultas");
  };

  const getPaymentColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "vencido":
        return "#dc3545";
      case "a pagar":
        return "#ffc107";
      case "pago":
        return "#28a745";
      default:
        return "white";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          width: "80vw",
          height: "80vh",
          top: "10vh",
          margin: "0 auto 30px auto",
          padding: "0",
          backgroundColor: "#2c3e50",
          color: "white",
          borderRadius: "10px",
          overflow: "hidden",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          zIndex: 1500,
        },
      }}
    >
      <div
        style={{
          backgroundColor: "#1c2c40",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>📝 Prontuário de {patient.name}</h3>
        <button
          onClick={onRequestClose}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            color: "white",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "20px", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <strong>Telefone:</strong>{" "}
            <a
              href={`https://wa.me/${patient.phone?.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#25D366" }}
            >
              {patient.phone || "-"}
            </a>
          </div>
          <div>
            <strong>Endereço:</strong> {patient.address || "-"}
          </div>
          <div>
            <strong>Nascimento:</strong> {formatDate(patient.birthdate)}
          </div>
        </div>

        <h5>Consultas</h5>
        {appointments.length === 0 ? (
          <p>Nenhuma consulta registrada.</p>
        ) : (
          <ul>
            {appointments.map((appt: any) => {
              const dateFormatted = new Date(appt.date).toLocaleString(
                "pt-BR",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                }
              );
              const tipo = appt.type === "remoto" ? "Remoto" : "Presencial";
              const meetLink = appt.link;
              const whatsappMessage = `Olá ${
                patient.name
              }, lembrete da sua consulta ${tipo.toLowerCase()} agendada para ${dateFormatted}${
                tipo === "Remoto" && meetLink ? ` no link: ${meetLink}` : ""
              }`;

              return (
                <li key={appt.id} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <strong>{dateFormatted}</strong>
                    <span>Tipo: {tipo}</span>
                    {tipo === "Remoto" && meetLink && (
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#0dcaf0" }}
                      >
                        🔗 Link do Meet
                      </a>
                    )}
                    <a
                      href={`https://wa.me/${patient.phone?.replace(
                        /\D/g,
                        ""
                      )}?text=${encodeURIComponent(whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0dcaf0" }}
                    >
                      📱 Enviar lembrete via WhatsApp
                    </a>
                  </div>
                  <textarea
                    value={editedDescriptions[appt.id] || ""}
                    onChange={(e) =>
                      setEditedDescriptions({
                        ...editedDescriptions,
                        [appt.id]: e.target.value,
                      })
                    }
                    rows={4}
                    style={{
                      width: "100%",
                      marginTop: 5,
                      borderRadius: 5,
                      padding: 10,
                    }}
                  ></textarea>
                  <div style={{ marginTop: 5 }}>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleSaveDescription(appt.id)}
                    >
                      Salvar
                    </button>{" "}
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleClearDescription(appt.id)}
                    >
                      Apagar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <h5>Pagamentos</h5>
        {payments.length === 0 ? (
          <p>Nenhum pagamento registrado.</p>
        ) : (
          <ul>
            {payments.map((p: any) => (
              <li
                key={p.id}
                style={{ color: getPaymentColor(p.status), marginBottom: 5 }}
              >
                {formatDate(p.dueDate)} -{" "}
                <strong>R$ {p.amount.toFixed(2)}</strong> - {p.status}
              </li>
            ))}
          </ul>
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button className="btn btn-primary" onClick={openAgendamento}>
            Agendar Nova Consulta
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProntuarioModal;
