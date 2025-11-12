import React, { useState, useEffect } from 'react';
// RUTA CORREGIDA: Asumimos que el servicio está en el mismo nivel o una ubicación accesible.
import { turnoService } from '../../services/turnoService.js';
// Asume que Tailwind CSS está disponible globalmente en tu proyecto.

const TurnoTable = () => {
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Nuevo estado para controlar qué turno necesita confirmación de eliminación
    const [confirmId, setConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Lógica de carga de datos
    useEffect(() => {
        const fetchTurnos = async () => {
            try {
                // Llama al servicio de turnos
                const data = await turnoService.obtenerTurnos();
                // NOTA: Los objetos Date y Time se recibirán como strings (ej. "2024-12-31", "10:00:00")
                setTurnos(data);
                setError(null);
            } catch (err) {
                setError("Error al cargar la lista de turnos. Revisa la conexión con el Backend.");
                console.error("Detalle del error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTurnos();
    }, []);

    // ---------------------------------
    // Lógica de Acciones
    // ---------------------------------

    const handleModificar = (id_turno) => {
        console.log(`[ACCIÓN] Modificar Turno ID: ${id_turno}`);
    };

    // Abre la UI de confirmación
    const handleEliminar = (id_turno) => {
        setConfirmId(id_turno);
    };

    // Confirma y ejecuta la eliminación (MODIFICADO para capturar error.message)
    const confirmDeletion = async () => {
        if (!confirmId) return;

        setIsDeleting(true);
        setError(null); // Limpiar errores antes de intentar
        try {
            // Llama al service (ya tiene manejo robusto de errores)
            await turnoService.eliminarTurno(confirmId);

            // Actualiza la lista eliminando el turno del estado local
            setTurnos(turnos.filter(t => t.id_turno !== confirmId));

            console.log(`Turno ID ${confirmId} eliminado con éxito.`);

        } catch (error) {
            // Captura el mensaje de error detallado del service y lo muestra
            setError(`Error al eliminar el turno: ${error.message}`);
            console.error("Error de eliminación:", error);
        } finally {
            setConfirmId(null);
            setIsDeleting(false);
        }
    };

    // Cancela la eliminación
    const cancelDeletion = () => {
        setConfirmId(null);
    };

    const turnoToDelete = turnos.find(t => t.id_turno === confirmId);

    // ---------------------------------
    // Componente de Fila
    // ---------------------------------
    const TurnoRow = ({ turno }) => {
        // Formateo del estado
        const estadoClase = turno.estado === 'disponible'
            ? 'text-green-600 font-semibold'
            : turno.estado === 'reservado'
            ? 'text-red-600 font-semibold'
            : 'text-gray-500 font-semibold'; // Otro estado

        return (
            <tr className="border-b transition duration-150 ease-in-out hover:bg-indigo-50/20">

                {/* Datos del Turno (adaptados al DTO) */}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{turno.id_turno}</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600">{turno.id_cancha}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{turno.fecha}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{turno.hora_inicio}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{turno.hora_fin}</td>
                <td className={`px-4 py-3 text-sm ${estadoClase}`}>{turno.estado.toUpperCase()}</td>

                {/* Columna de Acciones (Idéntica a CanchaTable) */}
                <td className="px-4 py-3 text-sm space-x-2">
                    <button
                        onClick={() => handleModificar(turno.id_turno)}
                        className="text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-600 px-3 py-1 rounded-full text-xs font-semibold transition duration-200"
                        disabled={isDeleting}
                    >
                        Modificar
                    </button>
                    <button
                        onClick={() => handleEliminar(turno.id_turno)}
                        className="text-red-600 hover:text-white hover:bg-red-600 border border-red-600 px-3 py-1 rounded-full text-xs font-semibold transition duration-200"
                        disabled={isDeleting}
                    >
                        Eliminar
                    </button>
                </td>
            </tr>
        );
    };

    // ---------------------------------
    // Renderizado (Loading, Error, Tabla)
    // ---------------------------------

    const ErrorDisplay = () => (
        <div className="cancha-error p-4 text-center border rounded-lg mx-auto max-w-lg mt-4">{error}</div>
    );

    if (loading) return <div className="cancha-loading p-8 text-center text-xl animate-pulse">Cargando turnos...</div>;
    if (turnos.length === 0) return <div className="cancha-empty p-8 text-center text-gray-500">No hay turnos registrados para mostrar.</div>;

    return (
        <div className="relative">
            {error && <ErrorDisplay />}
             <div className="overflow-x-auto shadow-2xl rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">

                    {/* Encabezado (Adaptado a campos de TurnoDTO) */}
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID Turno</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID Cancha</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hora Inicio</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hora Fin</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>

                    {/* Cuerpo de la Tabla */}
                    <tbody className="bg-white divide-y divide-gray-100">
                        {turnos.map(turno => (
                            <TurnoRow key={turno.id_turno} turno={turno} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Confirmación Simple (Idéntico a CanchaTable) */}
            {confirmId && turnoToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirmar Eliminación de Turno</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar el turno ID: <span className="font-bold text-red-500">{confirmId}</span>, en la cancha {turnoToDelete.id_cancha}, el {turnoToDelete.fecha} ({turnoToDelete.hora_inicio})? Esta acción es irreversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDeletion}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeletion}
                                className={`px-4 py-2 rounded-lg text-white font-semibold transition duration-150 ${isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TurnoTable;