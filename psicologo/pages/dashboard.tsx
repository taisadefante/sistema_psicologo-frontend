import { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard").then((response) => {
      setData(response.data);
    });
  }, []);

  if (!data) return <p>Carregando...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📊 Dashboard</h2>

      {/* Cards de Estatísticas */}
      <div className="row">
        <div className="col-md-3">
          <div className="card bg-primary text-white p-3">
            <h5>Total de Pacientes</h5>
            <h3>{data.totalPacientes}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white p-3">
            <h5>Consultas Concluídas</h5>
            <h3>{data.consultasConcluidas}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white p-3">
            <h5>Total de Consultas</h5>
            <h3>{data.totalConsultas}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white p-3">
            <h5>Faturamento Total (R$)</h5>
            <h3>R$ {data.faturamentoTotal.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Gráfico de Faturamento */}
      <div className="row mt-4">
        <div className="col-md-6">
          <h5>📈 Faturamento Mensal</h5>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={[
              ["Mês", "Faturamento"],
              ["Jan", 1000],
              ["Fev", 2000],
              ["Mar", 1500],
              ["Abr", 2500],
              ["Mai", 3000],
              ["Jun", 4000],
            ]}
          />
        </div>

        {/* Gráfico de Consultas Agendadas x Concluídas */}
        <div className="col-md-6">
          <h5>📊 Consultas Agendadas vs. Concluídas</h5>
          <Chart
            chartType="PieChart"
            width="100%"
            height="300px"
            data={[
              ["Status", "Quantidade"],
              ["Agendadas", data.totalConsultas - data.consultasConcluidas],
              ["Concluídas", data.consultasConcluidas],
            ]}
          />
        </div>
      </div>

      {/* Últimos Agendamentos */}
      <div className="mt-4">
        <h5>📅 Últimos Agendamentos</h5>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Psicólogo</th>
            </tr>
          </thead>
          <tbody>
            {data.ultimosAgendamentos.map((appointment: any) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{appointment.patient.name}</td>
                <td>{appointment.psychologist.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagamentos Pendentes */}
      <div className="mt-4">
        <h5>💰 Pagamentos Pendentes</h5>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Valor</th>
              <th>Vencimento</th>
            </tr>
          </thead>
          <tbody>
            {data.pagamentosPendentes.map((payment: any) => (
              <tr key={payment.id}>
                <td>{payment.patient.name}</td>
                <td>R$ {payment.amount.toFixed(2)}</td>
                <td>{new Date(payment.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
