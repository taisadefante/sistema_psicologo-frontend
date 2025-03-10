import React, { useState } from "react";
import axios from "axios";
import axiosInstance from "./axios"; // Importando a instância do Axios

const SaveDescription = ({ appointmentId }) => {
  const [description, setDescription] = useState("");

  // Função chamada quando o conteúdo do campo de descrição mudar
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  // Função chamada quando o botão "Salvar Descrição" for clicado
  const handleSaveDescription = async () => {
    try {
      // Envia a requisição POST para o backend para salvar a descrição
      const response = await axios.post(
        `http://localhost:5000/api/appointments/${appointmentId}/description`,
        { description }
      );
      console.log("Descrição salva com sucesso:", response.data);
      // Aqui você pode atualizar a UI ou fazer algo com a resposta
    } catch (error) {
      console.error("Erro ao salvar descrição:", error.message);
    }
  };

  return (
    <div>
      <textarea
        value={description}
        onChange={handleDescriptionChange}
        placeholder="Adicione uma descrição"
      />
      <button onClick={handleSaveDescription}>Salvar Descrição</button>
    </div>
  );
};

export default SaveDescription;
