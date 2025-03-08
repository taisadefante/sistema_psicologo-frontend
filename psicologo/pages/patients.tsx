import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import styles from "../styles/Patients.module.css";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

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
          }
        );
      } else {
        await axios.post("http://localhost:5000/api/patients", {
          name,
          phone,
          address,
          birthdate,
        });
      }
      setName("");
      setPhone("");
      setAddress("");
      setBirthdate("");
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
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`);
      fetchPatients();
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
    }
  };

  const columns = [
    {
      name: "Nome",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Telefone",
      selector: (row) => row.phone,
    },
    {
      name: "Endereço",
      selector: (row) => row.address,
    },
    {
      name: "Data de Nascimento",
      selector: (row) => formatDate(row.birthdate),
    },
    {
      name: "Ações",
      cell: (row) => (
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
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}></div>
      <div
        className={styles.content}
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
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
            placeholder="Data de Nascimento"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
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
