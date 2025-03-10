import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import styles from "../styles/Patients.module.css";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [editedDescriptions, setEditedDescriptions] = useState({});

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchAppointments();
      fetchPayments();
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/patients");
      const sortedPatients = response.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setPatients(sortedPatients);
      setFilteredPatients(sortedPatients);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/patients/${selectedPatient.id}/appointments`
      );
      setAppointments(response.data);
      const descriptionsMap = {};
      response.data.forEach((appt) => {
        descriptionsMap[appt.id] = appt.description || "";
      });
      setEditedDescriptions(descriptionsMap);
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/patients/${selectedPatient.id}/payments`
      );
      setPayments(response.data);
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
    }
  };

  const handleDescriptionChange = (id, value) => {
    setEditedDescriptions((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveDescription = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        description: editedDescriptions[id],
      });
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao salvar descrição:", error);
    }
  };

  const handleClearDescription = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        description: "",
      });
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao limpar descrição:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        (patient.birthdate && formatDate(patient.birthdate).includes(query))
    );
    setFilteredPatients(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await axios.put(
          `http://localhost:5000/api/patients/${editingPatient.id}`,
          {
            name,
            phone,
            address,
            birthdate,
            status,
          }
        );
      } else {
        await axios.post("http://localhost:5000/api/patients", {
          name,
          phone,
          address,
          birthdate,
          status,
        });
      }
      setName("");
      setPhone("");
      setAddress("");
      setBirthdate("");
      setStatus("Ativo");
      setEditingPatient(null);
      fetchPatients();
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setName(patient.name);
    setPhone(patient.phone);
    setAddress(patient.address);
    setBirthdate(patient.birthdate);
    setStatus(patient.status || "Ativo");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`);
      fetchPatients();
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
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
    { name: "Paciente", selector: (row) => row.name, sortable: true },
    {
      name: "Telefone",
      selector: (row) =>
        row.phone ? (
          <a
            href={`https://wa.me/${row.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {row.phone}
          </a>
        ) : (
          "-"
        ),
    },
    { name: "Endereço", selector: (row) => row.address },
    {
      name: "Data de Nascimento",
      selector: (row) => formatDate(row.birthdate),
    },
    {
      name: "Status",
      cell: (row) => (
        <select
          value={row.status || "Ativo"}
          onChange={async (e) => {
            await axios.put(`http://localhost:5000/api/patients/${row.id}`, {
              ...row,
              status: e.target.value,
            });
            fetchPatients();
          }}
          className="form-select form-select-sm"
        >
          <option>Ativo</option>
          <option>Inativo</option>
          <option>Pausado</option>
        </select>
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
            <img src="icon/pen.png" width="20px" />
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete(row.id)}
          >
            <img src="icon/bin.png" width="20px" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <h2 className={styles.title}>Gestão de Pacientes</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
          <select
            className={styles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Pausado">Pausado</option>
          </select>
          <button className={styles.button} type="submit">
            {editingPatient ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <input
          className={styles.search}
          type="text"
          placeholder="Pesquisar por Nome ou Data de Nascimento"
          value={search}
          onChange={handleSearch}
        />

        <DataTable
          columns={columns}
          data={filteredPatients}
          pagination
          highlightOnHover
          striped
        />
      </div>
    </div>
  );
};

export default Patients;
