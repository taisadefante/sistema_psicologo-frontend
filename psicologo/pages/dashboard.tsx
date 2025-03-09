import { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [dia, setDia] = useState("todos");
  const [mes, setMes] = useState("todos");
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/api/dashboard?dia=${dia}&mes=${mes}&ano=${ano}`
      )
      .then((response) => {
        setData(response.data);
      });
  }, [dia, mes, ano]);

  if (!data) return <p>Carregando...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📊 Dashboard</h2>

      {/* 📌 Filtro de Data */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label>Selecione o Dia:</label>
          <select
            className="form-control"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          >
            <option value="todos">Todos</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label>Selecione o Mês:</label>
          <select
            className="form-control"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          >
            <option value="todos">Todos</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("pt-BR", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label>Selecione o Ano:</label>
          <select
            className="form-control"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i
            ).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📌 Estatísticas Gerais */}
      <div className="row">
        <div className="col-md-3">
          <div className="card bg-primary text-white p-3">
            <h5>Total de Pacientes</h5>
            <h3>{data.totalPacientes}</h3>
          </div>
        </div>
      </div>

      {/* 📌 Faturamento */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card bg-warning text-white p-3">
            <h5>Faturamento Diário</h5>
            <h3>R$ {data.faturamentoDiario.toFixed(2)}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white p-3">
            <h5>Faturamento Mensal</h5>
            <h3>R$ {data.faturamentoMensal.toFixed(2)}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white p-3">
            <h5>Faturamento Anual</h5>
            <h3>R$ {data.faturamentoAnual.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* 📌 Pagamentos Pendentes */}
      <div className="mt-4">
        <h5>💰 Pagamentos Vencidos e a Vencer</h5>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.pagamentosPendentes.map((payment: any) => (
              <tr key={payment.id}>
                <td>{payment.patientName}</td>
                <td>R$ {payment.amount.toFixed(2)}</td>
                <td>{payment.dueDate}</td>
                <td>{payment.status === "pending" ? "A Vencer" : "Vencido"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
