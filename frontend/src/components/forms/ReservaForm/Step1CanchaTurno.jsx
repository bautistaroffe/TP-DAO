import React from 'react';

const formatTurno = (turno) => {
    if (!turno || !turno.fecha || !turno.hora_inicio || !turno.hora_fin) {
        return 'Turno no disponible';
    }
    const horaInicio = turno.hora_inicio.substring(0, 5);
    const horaFin = turno.hora_fin.substring(0, 5);
    // Asumiendo que la fecha viene como YYYY-MM-DD
    const [year, month, day] = turno.fecha.split('-');
    return `(${day}/${month}) ${horaInicio} - ${horaFin} (ID: ${turno.id_turno})`;
};

/**
 * Componente para el Paso 1: Selección de Cancha y Turno.
 * @param {object} props - Propiedades recibidas desde ReservaForm.jsx
 */
const Step1CanchaTurno = ({ formData, handleChange, canchas, turnos, validationErrors, loading }) => {

    // Lógica para filtrar los turnos disponibles (Transferida de tu archivo original)
    const turnosDisponibles = turnos.sort((a, b) => {
        // La ordenación sí es necesaria para la UX
        const dateA = new Date(`${a.fecha}T${a.hora_inicio}`);
        const dateB = new Date(`${b.fecha}T${b.hora_inicio}`);
        return dateA - dateB;
    });

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-indigo-700">1. Cancha y Turno</h3>

            {/* SELECCIÓN DE CANCHA */}
            <div className={validationErrors.id_cancha ? 'has-error' : ''}>
                <label htmlFor="id_cancha" className="block text-sm font-medium text-gray-700">
                    Cancha a Reservar
                </label>
                <select
                    id="id_cancha"
                    name="id_cancha"
                    value={formData.id_cancha}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full border ${validationErrors.id_cancha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                    disabled={loading}
                >
                    <option value="">-- Seleccione una Cancha --</option>
                    {canchas.map(c => (
                        <option key={c.id_cancha} value={c.id_cancha}>
                            {c.nombre} ({c.tipo.toUpperCase()}) - ${c.precio_base}
                        </option>
                    ))}
                </select>
                {validationErrors.id_cancha && <p className="text-xs text-red-500 mt-1">{validationErrors.id_cancha}</p>}
            </div>

            {/* SELECCIÓN DE TURNO */}
            <div className={validationErrors.id_turno ? 'has-error' : ''}>
                <label htmlFor="id_turno" className="block text-sm font-medium text-gray-700">
                    Turno Disponible
                </label>
                <select
                    id="id_turno"
                    name="id_turno"
                    value={formData.id_turno}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full border ${validationErrors.id_turno ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                    disabled={loading || !formData.id_cancha || turnosDisponibles.length === 0}
                >
                    <option value="">
                        {formData.id_cancha ? (turnosDisponibles.length > 0 ? '-- Seleccione un Turno --' : '🚫 No hay turnos disponibles') : '-- Primero seleccione una Cancha --'}
                    </option>
                    {turnosDisponibles.map(t => (
                        <option key={t.id_turno} value={t.id_turno}>
                            {formatTurno(t)}
                        </option>
                    ))}
                </select>
                {validationErrors.id_turno && <p className="text-xs text-red-500 mt-1">{validationErrors.id_turno}</p>}
                {!formData.id_cancha && <p className="text-xs text-gray-500 mt-1">Seleccione una cancha para ver los turnos disponibles.</p>}
                {formData.id_cancha && turnosDisponibles.length === 0 && <p className="text-xs text-orange-500 mt-1">No se encontraron turnos disponibles para la cancha seleccionada.</p>}
            </div>
        </div>
    );
};

export default Step1CanchaTurno;