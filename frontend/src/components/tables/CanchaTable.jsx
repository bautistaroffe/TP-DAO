// src/components/CanchaTable.jsx

import React, { useState, useEffect } from 'react';
import { canchaService } from '../../services/canchaService.js'; // Asegúrate de que la ruta sea correcta

const CanchaTable = ({ onEditStart }) => {
    const [canchas, setCanchas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Lógica de carga de datos
    useEffect(() => {
        const fetchCanchas = async () => {
            try {
                const data = await canchaService.obtenerCanchas();
                setCanchas(data);
                setError(null);
            } catch (err) {
                setError("Error al cargar la lista de canchas. Revisa la conexión con el Backend.");
                console.error("Detalle del error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCanchas();
    }, []);

    // ---------------------------------
    // Lógica de Acciones
    // ---------------------------------

    const handleModificar = (id_cancha) => {
        console.log(`[ACCIÓN] Modificar Cancha ID: ${id_cancha}`);

        // 🟢 NUEVA LÍNEA: Llama al callback para abrir el formulario
        if (onEditStart) {
            onEditStart(id_cancha);
        }
    };

    // Abre la UI de confirmación
    const handleEliminar = (id_cancha) => {
        setConfirmId(id_cancha);
    };

    // Confirma y ejecuta la eliminación
    const confirmDeletion = async () => {
        if (!confirmId) return;

        setIsDeleting(true);
        try {
            await canchaService.eliminarCancha(confirmId);

            // Actualiza la lista en el estado local
            setCanchas(canchas.filter(c => c.id_cancha !== confirmId));

            console.log(`Cancha ID ${confirmId} eliminada con éxito.`);

        } catch (error) {
            setError(`Error al eliminar la cancha: ${error.message}`);
            console.error(error);
        } finally {
            setConfirmId(null);
            setIsDeleting(false);
        }
    };

    // Cancela la eliminación
    const cancelDeletion = () => {
        setConfirmId(null);
    };

    const canchaToDelete = canchas.find(c => c.id_cancha === confirmId);

    // ---------------------------------
    // Componente de Fila
    // ---------------------------------
    const CanchaRow = ({ cancha }) => {
        const estadoClase = cancha.estado === 'disponible'
            ? 'text-green-600 font-semibold'
            : 'text-red-600 font-semibold';

        const techadaIcono = cancha.techada ? '✅' : '❌';
        const iluminacionIcono = cancha.iluminacion ? '💡' : '🌑';


        return (
            <tr className="border-b transition duration-150 ease-in-out hover:bg-indigo-50/20">

                {/* Datos de la Cancha */}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{cancha.id_cancha}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{cancha.nombre}</td>
                <td className="px-4 py-3 text-sm font-medium text-blue-600">{cancha.tipo.toUpperCase()}</td>

                {/* Superficie */}
                <td className="px-4 py-3 text-sm text-gray-500">{cancha.superficie || '---'}</td>

                {/* Tamaño */}
                <td className="px-4 py-3 text-sm text-gray-500">{cancha.tamaño || '---'}</td>

                <td className="px-4 py-3 text-sm font-bold text-indigo-700">${cancha.precio_base.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-center">{techadaIcono}</td>
                <td className="px-4 py-3 text-sm text-center">{iluminacionIcono}</td>
                <td className={`px-4 py-3 text-sm ${estadoClase}`}>{cancha.estado.toUpperCase()}</td>

                {/* Columna de Acciones */}
                <td className="px-4 py-3 text-sm space-x-2">
                    <button
                        onClick={() => handleModificar(cancha.id_cancha)}
                        className="text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-600 px-3 py-1 rounded-full text-xs font-semibold transition duration-200"
                    >
                        Modificar
                    </button>
                    <button
                        onClick={() => handleEliminar(cancha.id_cancha)}
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

    // Mensajes de estado
    if (loading) return <div className="p-4 text-center text-xl text-indigo-500 animate-pulse">Cargando canchas...</div>;
    if (error) return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded-lg mx-auto max-w-lg">{error}</div>;
    if (canchas.length === 0) return <div className="p-4 text-center text-gray-500">No hay canchas registradas para mostrar.</div>;

    return (
        <div className="relative">
             <div className="overflow-x-auto shadow-2xl rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">

                    {/* Encabezado */}
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Superficie</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tamaño</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Precio/h</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Techada</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Iluminación</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>

                    {/* Cuerpo de la Tabla */}
                    <tbody className="bg-white divide-y divide-gray-100">
                        {canchas.map(cancha => (
                            <CanchaRow key={cancha.id_cancha} cancha={cancha} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Confirmación */}
            {confirmId && canchaToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar la cancha: <span className="font-bold text-red-500">{canchaToDelete.nombre} (ID: {confirmId})</span>? Esta acción es irreversible.
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

export default CanchaTable;