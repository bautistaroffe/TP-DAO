import { useState } from "react";
import { torneoService } from "../../services/torneoService.js";

const TorneoForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    cupo_cta: "",
    cupo_total: "",
    categoria: "", // solo una categoría
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nombre: formData.nombre,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        cupo_cta: parseInt(formData.cupo_cta),
        cupo_total: parseInt(formData.cupo_total),
        categoria: formData.categoria,
      };

      console.log("Enviando torneo al backend:", payload);

      await torneoService.crearTorneo(payload);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear torneo:", error);
      alert(
        "Error al guardar el torneo: " +
          (error.message || JSON.stringify(error))
      );
    }
  };

  const categorias = ["Sub 10", "Sub 12", "Sub 14", "Sub 16"];

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold text-indigo-700">Crear Torneo</h2>

      <input
        type="text"
        name="nombre"
        placeholder="Nombre del torneo"
        value={formData.nombre}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
          <input
            type="date"
            name="fecha_fin"
            value={formData.fecha_fin}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <input
        type="number"
        name="cupo_cta"
        placeholder="Cupo por cuenta"
        value={formData.cupo_cta}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="number"
        name="cupo_total"
        placeholder="Cupo total"
        value={formData.cupo_total}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <select
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Seleccione categoría</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default TorneoForm;




