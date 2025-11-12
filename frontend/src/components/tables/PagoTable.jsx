// src/components/PagoTable.jsx

import React, { useState, useEffect } from 'react';
import { pagoService } from '../../services/pagoService.js'; // Asegúrate de que la ruta sea correcta

const PagoTable = () => {
    // Estados
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    // Lógica de carga de datos
    useEffect(() => {
        const fetchPagos = async () => {
            try {
                const data = await pagoService.obtenerPagos();
                setPagos(data);
                setError(null);
            } catch (err) {
                setError("Error al cargar la lista de pagos. Intente más tarde.");
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
        console.log(`Modificar Pago ID: ${id_pago}`);
        // Implementar navegación a formulario de edición
    };

    const handleEliminar = (id_pago) => {
        setConfirmId(id_pago); // Abre el modal de confirmación
    };

    const cancelDeletion = () => {
        setConfirmId(null);
    };

    const confirmDeletion = async () => {
        const idToDelete = confirmId;
        if (!idToDelete) return;

        try {
            // Llama al servicio de eliminación
            await pagoService.eliminarPago(idToDelete);

            // Actualiza la lista en el estado (sin recargar toda la página)
            setPagos(pagos.filter(p => p.id_pago !== idToDelete));
            console.log(`Pago ${idToDelete} eliminado con éxito.`);

        } catch (err) {
            setError(`Error al eliminar el pago ${idToDelete}.`);
            console.error("Error de eliminación:", err);
        } finally {
            cancelDeletion(); // Cierra el modal de confirmación
        }
    };

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

                {/* Celda de Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                        onClick={() => handleModificar(pago.id_pago)}
                        className="text-indigo-600 hover:text-indigo-800 transition duration-150 p-1 rounded-full hover:bg-indigo-100"
                        aria-label={`Modificar Pago ${pago.id_pago}`}
                    >
                        {/* Icono de Lápiz */}
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button
                        onClick={() => handleEliminar(pago.id_pago)}
                        className="text-red-600 hover:text-red-800 transition duration-150 p-1 rounded-full hover:bg-red-100"
                        aria-label={`Eliminar Pago ${pago.id_pago}`}
                    >
                        {/* Icono de Basura */}
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            </tr>
        );
    };


    // ---------------------------------
    // Renderizado Principal
    // ---------------------------------

    // Renderizado Condicional...
    if (loading) return <div className="p-4 text-center text-indigo-600 font-semibold">Cargando datos de pagos...</div>;
    if (error) return <div className="p-4 text-center text-red-600 font-semibold border border-red-200 bg-red-50 rounded-lg">Error: {error}</div>;
    if (pagos.length === 0) return <div className="p-4 text-center text-gray-500 font-semibold">No se encontraron pagos registrados.</div>;

    return (
        <div className="relative">
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
            {confirmId && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-700 mb-6">
                            ¿Está seguro de que desea eliminar el pago con ID: <span className="font-bold">{confirmId}</span>?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDeletion}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeletion}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagoTable;