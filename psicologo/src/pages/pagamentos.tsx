import { useEffect, useState } from "react";
import axios from "axios";

const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/payments")
      .then((response) => {
        const sortedPayments = response.data.map((payment: any) => ({
          ...payment,
          formattedDate: payment.dueDate
            ? new Date(payment.dueDate).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "Data Inválida",
          patientName: payment.patientName || "Paciente Desconhecido",
        }));

        setPayments(sortedPayments);
      })
      .catch((error) => {
        console.error("Erro ao buscar pagamentos:", error);
      });
  }, []);

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/payments/${id}`,
        { status }
      );

      if (response.status === 200) {
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment.id === id ? { ...payment, status } : payment
          )
        );
      } else {
        console.error(
          "Erro ao atualizar status do pagamento: Resposta não esperada"
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status do pagamento:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Pagamentos</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Data</th>
            <th>Paciente</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment: any) => (
              <tr key={payment.id}>
                <td>{payment.formattedDate}</td>
                <td>{payment.patientName}</td>
                <td>R$ {payment.amount.toFixed(2)}</td>
                <td>
                  <span
                    className={`badge ${
                      payment.status === "Pago"
                        ? "bg-success"
                        : payment.status === "A Pagar"
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td>
                  <select
                    className="form-select"
                    value={payment.status}
                    onChange={(e) =>
                      updatePaymentStatus(payment.id, e.target.value)
                    }
                  >
                    <option value="Pago">Pago</option>
                    <option value="A Pagar">A Pagar</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                Nenhum pagamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
