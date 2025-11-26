import { useState, useEffect } from "react";
import { torneoService } from "../../services/torneoService.js";

const TorneoForm = ({ id_torneo, onSuccess, onCancel }) => {
  const isEditing = !!id_torneo;

  const [formData, setFormData] = useState({
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    categoria: "",
  });

  const [loading, setLoading] = useState(false);

  // 👉 Cargar datos al editar
  useEffect(() => {
    if (!isEditing) return;

    setLoading(true);

    torneoService
      .obtenerTorneoPorId(id_torneo)
      .then((data) => {
        setFormData({
          nombre: data.nombre ?? "",
          fecha_inicio: data.fecha_inicio ?? "",
          fecha_fin: data.fecha_fin ?? "",
          categoria: data.categoria ?? "",
        });
        setLoading(false);
      })
      .catch((err) => {
        alert("Error al cargar torneo: " + err.message);
        setLoading(false);
      });
  }, [isEditing, id_torneo]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 👉 Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nombre: formData.nombre,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        categoria: formData.categoria,
      };

      if (isEditing) {
        await torneoService.ActualizarTorneo(id_torneo, payload);
      } else {
        await torneoService.crearTorneo(payload);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      alert(
        "Error al guardar torneo: " +
          (error.message || JSON.stringify(error))
      );
    }
  };

  const categorias = ["Sub 10", "Sub 12", "Sub 14", "Sub 16"];

  if (loading) {
    return <div className="p-6 text-indigo-600">Cargando torneo...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold text-indigo-700">
        {isEditing ? `Editar Torneo (ID: ${id_torneo})` : "Crear Torneo"}
      </h2>

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
          <label className="block text-sm font-medium">Fecha Inicio</label>
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
          <label className="block text-sm font-medium">Fecha Fin</label>
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

      <div>
        <label className="block text-sm font-medium">Categoría</label>
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
          {isEditing ? "Guardar Cambios" : "Crear Torneo"}
        </button>
      </div>
    </form>
  );
};

export default TorneoForm;






