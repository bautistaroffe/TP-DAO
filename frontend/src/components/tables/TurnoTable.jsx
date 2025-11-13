import React, { useState, useEffect, useCallback } from 'react';
import { turnoService } from '../../services/turnoService.js';
import TurnoForm from '../forms/TurnoForm.jsx'; // Importamos el formulario

// Asume que Tailwind CSS está disponible globalmente en tu proyecto.

const TurnoTable = () => {
    // --- Estado de la Tabla ---
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Estado del Formulario ---
    // null: Mostrar tabla
    // 0: Modo creación
    // ID > 0: Modo edición
    const [editId, setEditId] = useState(null);

    // Lógica de carga de datos (Se define una función que se puede reusar)
    const fetchTurnos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await turnoService.obtenerTurnos();
            setTurnos(data);
        } catch (err) {
            setError("Error al cargar la lista de turnos. Revisa la conexión con el Backend.");
            console.error("Detalle del error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Hook para ejecutar la carga inicial y el refresco
    useEffect(() => {
        // Solo cargar si no estamos en modo formulario
        if (editId === null) {
            fetchTurnos();
        }
    }, [fetchTurnos, editId]);

    // ---------------------------------
    // Lógica de Acciones de la Tabla
    // ---------------------------------

    // Inicia el modo Edición
    const handleModificar = (id_turno) => {
        setEditId(id_turno); // ID para edición
    };

    // Inicia el modo Creación
    const handleAgregarTurno = () => {
        setEditId(0); // 0 indica creación
    };

    // Callback de éxito/cancelación del formulario
    const handleFormClose = () => {
        setEditId(null); // Volver a la tabla
        fetchTurnos();   // Refrescar datos después de crear/modificar
    };

    // Abre la UI de confirmación para eliminar
    const handleEliminar = (id_turno) => {
        setConfirmId(id_turno);
    };

    // Confirma y ejecuta la eliminación
    const confirmDeletion = async () => {
        if (!confirmId) return;

        setIsDeleting(true);
        setError(null);
        try {
            await turnoService.eliminarTurno(confirmId);

            // Actualiza la lista eliminando el turno del estado local
            setTurnos(turnos.filter(t => t.id_turno !== confirmId));

            console.log(`Turno ID ${confirmId} eliminado con éxito.`);

        } catch (error) {
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
        const estadoClase = turno.estado === 'disponible'
            ? 'text-green-600 font-semibold'
            : turno.estado === 'reservado'
            ? 'text-red-600 font-semibold'
            : 'text-gray-500 font-semibold'; // Otro estado

        return (
            <tr className="border-b transition duration-150 ease-in-out hover:bg-indigo-50/20">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{turno.id_turno}</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600">{turno.id_cancha}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{turno.fecha}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{turno.hora_inicio.substring(0, 5)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{turno.hora_fin.substring(0, 5)}</td>
                <td className={`px-4 py-3 text-sm ${estadoClase}`}>{turno.estado.toUpperCase()}</td>

                {/* Columna de Acciones */}
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
    // Renderizado Principal
    // ---------------------------------

    // Si editId es 0 (creación) o > 0 (edición), mostramos el formulario
    if (editId !== null) {
        return (
            <TurnoForm
                idTurno={editId > 0 ? editId : null} // Pasamos null si es creación (editId=0)
                onSuccess={handleFormClose}
                onCancel={handleFormClose}
            />
        );
    }

    // Renderizado de la tabla
    const ErrorDisplay = () => (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mx-auto max-w-2xl mt-4">
            <p className='font-bold'>Error:</p>
            {error}
        </div>
    );

    return (
        <div className="relative p-6">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Gestión de Turnos</h1>
            <p className="text-gray-600 mb-6">Aquí se listarán, crearán, editarán y eliminarán todos los turnos de tu complejo deportivo.</p>

            {/* Botón para abrir el formulario de creación */}
            <div className="mb-4">
                <button
                    onClick={handleAgregarTurno}
                    className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md hover:shadow-lg"
                    disabled={loading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Agregar Turno</span>
                </button>
            </div>

            {error && <ErrorDisplay />}

            {loading ? (
                <div className="p-8 text-center text-xl text-indigo-500 animate-pulse">Cargando turnos...</div>
            ) : turnos.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">No hay turnos registrados para mostrar.</div>
            ) : (
                <div className="overflow-x-auto shadow-2xl rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">

                        {/* Encabezado */}
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
            )}

            {/* Modal de Confirmación */}
            {confirmId && turnoToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirmar Eliminación de Turno</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar el turno ID: <span className="font-bold text-red-500">{confirmId}</span>, en la cancha {turnoToDelete.id_cancha}, el {turnoToDelete.fecha} ({turnoToDelete.hora_inicio.substring(0, 5)})? Esta acción es irreversible.
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