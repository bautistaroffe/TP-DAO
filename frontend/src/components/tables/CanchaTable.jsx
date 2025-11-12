// src/components/CanchaTable.jsx

import React, { useState, useEffect } from 'react';
import { canchaService } from '../../services/canchaService.js';
// Asume que necesitas 'useNavigate' si usas React Router para la navegación
// import { useNavigate } from 'react-router-dom';

const CanchaTable = () => {
    // const navigate = useNavigate(); // Descomentar si usas React Router
    const [canchas, setCanchas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lógica de carga de datos (sin cambios)
    useEffect(() => {
        const fetchCanchas = async () => {
            // ... (código de fetchCanchas existente) ...
            try {
                const data = await canchaService.obtenerCanchas();
                setCanchas(data);
                setError(null);
            } catch (err) {
                setError("Error al cargar la lista de canchas. Intente más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchCanchas();
    }, []);

    // ---------------------------------
    // Lógica de los botones de Acción
    // ---------------------------------

    const handleModificar = (id_cancha) => {
        // Lógica para modificar: Típicamente navega a un formulario de edición
        console.log(`Modificar Cancha ID: ${id_cancha}`);
        // navigate(`/canchas/editar/${id_cancha}`); // Ejemplo con React Router
    };

    const handleEliminar = (id_cancha) => {
        // Lógica para eliminar: Típicamente muestra un modal de confirmación y luego llama al servicio DELETE
        if (window.confirm(`¿Estás seguro de que quieres eliminar la cancha con ID: ${id_cancha}?`)) {
            console.log(`Eliminar Cancha ID: ${id_cancha}`);
            // Aquí iría la llamada a canchaService.eliminar(id_cancha).then(...)
        }
    };

    // ---------------------------------
    // Componente de Fila (Ajustado)
    // ---------------------------------
    const CanchaRow = ({ cancha }) => {
        const estadoClase = cancha.estado === 'disponible' ? 'text-green-600 font-bold' : 'text-red-600';
        const techadaIcono = cancha.techada ? '✅ Sí' : '❌ No';
        const iluminacionIcono = cancha.iluminacion ? '💡 Sí' : '🌑 No';

        return (
            <tr className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cancha.id_cancha}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cancha.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cancha.tipo.toUpperCase()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cancha.superficie || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">${cancha.precio_base.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{techadaIcono}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{iluminacionIcono}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${estadoClase}`}>{cancha.estado.toUpperCase()}</td>

                {/* 🔹 NUEVA CELDA DE ACCIONES 🔹 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                        onClick={() => handleModificar(cancha.id_cancha)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2 border border-indigo-600 px-3 py-1 rounded transition duration-150 ease-in-out"
                    >
                        Modificar
                    </button>
                    <button
                        onClick={() => handleEliminar(cancha.id_cancha)}
                        className="text-red-600 hover:text-red-900 border border-red-600 px-3 py-1 rounded transition duration-150 ease-in-out"
                    >
                        Eliminar
                    </button>
                </td>
                {/* 🔹 FIN NUEVA CELDA 🔹 */}
            </tr>
        );
    };

    // ---------------------------------
    // Renderizado (Ajustado)
    // ---------------------------------
    if (loading || error || canchas.length === 0) {
        // ... (código de loading/error/empty existente) ...
        return <div className="p-4">{loading ? 'Cargando...' : error || 'No hay canchas.'}</div>;
    }

    return (
        <div className="cancha-table-container shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {/* Columnas Existentes */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Superficie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio/h</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Techada</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iluminación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        {/* 🔹 NUEVA COLUMNA DE ACCIONES 🔹 */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        {/* 🔹 FIN NUEVA COLUMNA 🔹 */}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {canchas.map(cancha => (
                        <CanchaRow key={cancha.id_cancha} cancha={cancha} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CanchaTable;