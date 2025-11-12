// src/components/ReservaTable.jsx

import React, { useState, useEffect } from 'react';
import { reservaService } from '../../services/reservaService.js'; // Asegúrate de que la ruta sea correcta

const ReservaTable = () => {
    // Estados
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Lógica de carga de datos
    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const data = await reservaService.obtenerReservas();
                setReservas(data);
                setError(null);
            } catch (err) {
                setError("Error al cargar la lista de reservas. Revisa la conexión con el Backend.");
                console.error("Detalle del error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReservas();
    }, []);

    // ---------------------------------
    // Lógica de Acciones
    // ---------------------------------

    const handleModificar = (id_reserva) => {
        console.log(`Modificar Reserva ID: ${id_reserva}`);
    };

    const handleEliminar = (id_reserva) => {
        setConfirmId(id_reserva); // Abre el modal de confirmación
    };

    const cancelDeletion = () => {
        setConfirmId(null);
    };

    const confirmDeletion = async () => {
        const idToDelete = confirmId;
        if (!idToDelete) return;

        setIsDeleting(true);
        setError(null); // Limpiar errores previos

        try {
            // Llama al servicio de eliminación
            await reservaService.eliminarReserva(idToDelete);

            // Actualiza la lista en el estado
            setReservas(reservas.filter(r => r.id_reserva !== idToDelete));
            console.log(`Reserva ${idToDelete} eliminada con éxito.`);

        } catch (err) {
            // Captura el mensaje de error detallado del servicio
            setError(`Error al eliminar la reserva: ${err.message}`);
            console.error("Error de eliminación:", err);
        } finally {
            setIsDeleting(false);
            cancelDeletion(); // Cierra el modal de confirmación
        }
    };

    // Encuentra la reserva a eliminar para mostrar el ID en el modal
    const reservaToDelete = reservas.find(r => r.id_reserva === confirmId);

    // ---------------------------------
    // Componente de Fila
    // ---------------------------------
    const ReservaRow = ({ reserva }) => {
        // Lógica de clases para el estado de la reserva
        let estadoClase = 'text-gray-500';
        if (reserva.estado === 'confirmada') {
            estadoClase = 'text-green-600 font-bold';
        } else if (reserva.estado === 'cancelada') {
            estadoClase = 'text-red-600 font-bold';
        } else if (reserva.estado === 'pendiente') {
             estadoClase = 'text-yellow-600 font-bold';
        }

        // Formateo de monto como moneda (asumiendo moneda local)
        const montoFormateado = reserva.precio_total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

        return (
            <tr className="border-b border-gray-100 hover:bg-indigo-50 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reserva.id_reserva}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reserva.id_cancha}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reserva.id_turno}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reserva.id_cliente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.id_torneo || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.id_servicio || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{montoFormateado}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${estadoClase}`}>{reserva.estado.toUpperCase()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.origen}</td>

                {/* Celda de Acciones (CORREGIDA: Botones de texto) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                        onClick={() => handleModificar(reserva.id_reserva)}
                        className="text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-600 px-3 py-1 rounded-lg text-xs font-semibold transition duration-200 disabled:opacity-50"
                        aria-label={`Modificar Reserva ${reserva.id_reserva}`}
                        disabled={isDeleting}
                    >
                        Modificar
                    </button>
                    <button
                        onClick={() => handleEliminar(reserva.id_reserva)}
                        className="text-red-600 hover:text-white hover:bg-red-600 border border-red-600 px-3 py-1 rounded-lg text-xs font-semibold transition duration-200 disabled:opacity-50"
                        aria-label={`Eliminar Reserva ${reserva.id_reserva}`}
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

    // Visualización del error detallado
    const ErrorDisplay = () => (
        <div className="p-4 text-center text-red-700 font-semibold border border-red-300 bg-red-100 rounded-lg mx-auto max-w-lg mt-4">
            Error: {error}
        </div>
    );

    // Renderizado Condicional...
    if (loading) return <div className="p-4 text-center text-indigo-600 font-semibold">Cargando datos de reservas...</div>;
    if (reservas.length === 0) return <div className="p-4 text-center text-gray-500 font-semibold">No se encontraron reservas registradas.</div>;

    return (
        <div className="relative">
            {error && <ErrorDisplay />}
            <div className="shadow-2xl bg-white rounded-xl overflow-hidden mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-600 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Cancha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Turno</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Torneo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Servicio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Precio Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Origen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reservas.map(reserva => (
                            <ReservaRow key={reserva.id_reserva} reserva={reserva} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            {confirmId && reservaToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-700 mb-6">
                            ¿Está seguro de que desea eliminar la reserva con ID: <span className="font-bold text-red-500">{confirmId}</span>?
                            Esta reserva es por ${reservaToDelete.precio_total.toFixed(2)}. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDeletion}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeletion}
                                className={`px-4 py-2 text-white rounded-lg transition ${isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservaTable;