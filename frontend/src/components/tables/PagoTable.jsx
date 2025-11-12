// src/components/PagoTable.jsx

import React, { useState, useEffect } from 'react';
import { pagoService } from '../../services/pagoService.js'; // Asegúrate de que la ruta sea correcta

const PagoTable = () => {
    // Estados
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Lógica de carga de datos
    useEffect(() => {
        const fetchPagos = async () => {
            try {
                const data = await pagoService.obtenerPagos();
                setPagos(data);
                setError(null);
            } catch (err) {
                // Muestra un error genérico si el servicio no puede obtener el detalle
                setError("Error al cargar la lista de pagos. Revisa la conexión con el Backend.");
                console.error("Detalle del error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPagos();
    }, []);

    // ---------------------------------
    // Lógica de Acciones
    // ---------------------------------

    const handleModificar = (id_pago) => {
        console.log(`[ACCIÓN] Modificar Pago ID: ${id_pago}`);
    };

    const handleEliminar = (id_pago) => {
        setConfirmId(id_pago);
    };

    const cancelDeletion = () => {
        setConfirmId(null);
    };

    const confirmDeletion = async () => {
        const idToDelete = confirmId;
        if (!idToDelete) return;

        setIsDeleting(true);
        setError(null); // Limpiar errores antes de intentar

        try {
            await pagoService.eliminarPago(idToDelete);

            // Actualiza la lista en el estado (sin recargar toda la página)
            setPagos(pagos.filter(p => p.id_pago !== idToDelete));
            console.log(`Pago ${idToDelete} eliminado con éxito.`);

        } catch (err) {
            // Aquí capturamos el mensaje de error detallado del servicio
            setError(`Error al eliminar el pago: ${err.message}`);
            console.error("Error de eliminación:", err);
        } finally {
            setIsDeleting(false);
            cancelDeletion(); // Cierra el modal de confirmación
        }
    };

    const pagoToDelete = pagos.find(p => p.id_pago === confirmId);

    // ---------------------------------
    // Componente de Fila
    // ---------------------------------
    const PagoRow = ({ pago }) => {
        // Lógica de clases y formato para el estado de la transacción
        let estadoClase = 'text-gray-500';
        if (pago.estado_transaccion === 'aprobado') {
            estadoClase = 'text-green-600 font-bold';
        } else if (pago.estado_transaccion === 'rechazado') {
            estadoClase = 'text-red-600 font-bold';
        } else if (pago.estado_transaccion === 'pendiente') {
             estadoClase = 'text-yellow-600 font-bold';
        }

        // Formateo de fecha y hora
        const fechaFormateada = pago.fecha_pago
            ? new Date(pago.fecha_pago).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
            : 'N/A';

        // Formateo de monto como moneda (asumiendo moneda local)
        const montoFormateado = pago.monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

        return (
            <tr className="border-b border-gray-100 hover:bg-indigo-50 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pago.id_pago}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pago.id_usuario}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pago.id_reserva}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{montoFormateado}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{fechaFormateada}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pago.metodo}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${estadoClase}`}>{pago.estado_transaccion.toUpperCase()}</td>

                {/* Celda de Acciones (CORREGIDA: Texto en lugar de Iconos) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                        onClick={() => handleModificar(pago.id_pago)}
                        // Clases para botón de texto simple (Modificar)
                        className="text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-600 px-3 py-1 rounded-lg text-xs font-semibold transition duration-200 disabled:opacity-50"
                        aria-label={`Modificar Pago ${pago.id_pago}`}
                        disabled={isDeleting}
                    >
                        Modificar
                    </button>
                    <button
                        onClick={() => handleEliminar(pago.id_pago)}
                        // Clases para botón de texto simple (Eliminar)
                        className="text-red-600 hover:text-white hover:bg-red-600 border border-red-600 px-3 py-1 rounded-lg text-xs font-semibold transition duration-200 disabled:opacity-50"
                        aria-label={`Eliminar Pago ${pago.id_pago}`}
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

    if (loading) return <div className="p-4 text-center text-indigo-600 font-semibold">Cargando datos de pagos...</div>;
    if (pagos.length === 0) return <div className="p-4 text-center text-gray-500 font-semibold">No se encontraron pagos registrados.</div>;

    return (
        <div className="relative">
            {error && <ErrorDisplay />}
            <div className="shadow-2xl bg-white rounded-xl overflow-hidden mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-600 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID Reserva</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Monto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fecha/Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Método</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pagos.map(pago => (
                            <PagoRow key={pago.id_pago} pago={pago} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            {confirmId && pagoToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Está seguro de que desea eliminar el pago con ID: <span className="font-bold">{confirmId}</span>?
                            El pago es por <span className="font-bold">{pagoToDelete.monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>. Esta acción no se puede deshacer.
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

export default PagoTable;