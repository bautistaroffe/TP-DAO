// src/forms/ReservaForm.jsx

import React, { useState } from 'react';
// 👈 IMPORTAMOS el servicio real
import { crearReserva } from '../../services/reservaService';

const ReservaForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    id_cancha: '',
    id_turno: '',
    id_cliente: '',
    id_torneo: '',
    id_servicio: '',
    // Los campos 'estado' y 'origen' serán manejados por el backend (o enviados con valores fijos si es necesario)
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(''); // Para errores generales de la API

  // --- 1.1. Lógica de Validación (Frontend) ---
  const validate = () => {
    let newErrors = {};
    if (!formData.id_cancha) newErrors.id_cancha = 'Selecciona una cancha.';
    if (!formData.id_turno) newErrors.id_turno = 'Selecciona un turno/horario.';
    if (!formData.id_cliente) newErrors.id_cliente = 'El ID de cliente es obligatorio.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ... (handleChange es el mismo)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setGeneralError(''); // Limpiar errores generales al cambiar algo
  };

  // --- 1.2. Manejo de Envío (Submit) con el Service ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepara los datos a enviar. Solo incluimos campos con valor.
      const datosParaAPI = Object.fromEntries(
          Object.entries(formData).filter(([, v]) => v !== null && v !== '')
      );

      // 🚀 Llamada a la función del servicio 🚀
      const reservaCreada = await crearReserva(datosParaAPI);

      console.log('Reserva registrada:', reservaCreada);
      alert('✅ Reserva registrada con éxito!');
      onClose(); // Cierra el formulario

    } catch (error) {
      console.error('Error al registrar la reserva:', error);
      // 👇 Aquí capturamos el error detallado lanzado por reservaService.js
      setGeneralError(`🛑 ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reserva-form-container">
      <h3>Nueva Reserva</h3>
      <form onSubmit={handleSubmit}>

        {/* ... (Campos del formulario) ... */}

        <div>
          <label htmlFor="id_cancha">Cancha (FK):</label>
          <input type="number" name="id_cancha" value={formData.id_cancha} onChange={handleChange} placeholder="Ej: 1" />
          {errors.id_cancha && <p className="error">{errors.id_cancha}</p>}
        </div>

        <div>
          <label htmlFor="id_turno">Turno/Horario (FK):</label>
          <input type="number" name="id_turno" value={formData.id_turno} onChange={handleChange} placeholder="Ej: 5" />
          {errors.id_turno && <p className="error">{errors.id_turno}</p>}
        </div>

        {/* Campo Cliente (FK: id_cliente) */}
        {/* Si el usuario está logueado, este campo puede ser oculto/prellenado */}
        <div>
          <label htmlFor="id_cliente">ID Cliente:</label>
          <input
            type="text"
            name="id_cliente"
            value={formData.id_cliente}
            onChange={handleChange}
            placeholder="Tu ID de Usuario"
          />
          {errors.id_cliente && <p className="error">{errors.id_cliente}</p>}
        </div>

        {/* Campo Torneo (Opcional) */}
        <div>
          <label htmlFor="id_torneo">Torneo (Opcional):</label>
          <input
            type="text"
            name="id_torneo"
            value={formData.id_torneo}
            onChange={handleChange}
            placeholder="ID Torneo"
          />
        </div>

        {/* Campo Servicio Adicional (Opcional) */}
        <div>
          <label htmlFor="id_servicio">Servicio Adicional (Opcional):</label>
          <input
            type="text"
            name="id_servicio"
            value={formData.id_servicio}
            onChange={handleChange}
            placeholder="ID Servicio"
          />
        </div>
        {/* Mostrar error general si existe */}
        {generalError && <p className="error general-error">🛑 {generalError}</p>}
        {/* Botones */}
        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Confirmar Reserva'}
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservaForm;