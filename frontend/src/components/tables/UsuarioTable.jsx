// src/components/UsuarioTable.jsx

import React, { useState, useEffect } from 'react';
import { usuarioService } from '../../services/usuarioService.js'; // Asegúrate de que la ruta sea correcta

const UsuarioTable = () => {
    // Estados
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false); // Estado de carga de eliminación

    // Lógica de carga de datos
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const data = await usuarioService.obtenerUsuarios();
                setUsuarios(data);
                setError(null);
            } catch (err) {
                setError("Error al cargar la lista de usuarios. Revisa la conexión con el Backend.");
                console.error("Detalle del error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    // ---------------------------------
    // Lógica de Acciones
    // ---------------------------------

    const handleModificar = (id_usuario) => {
        console.log(`Modificar Usuario ID: ${id_usuario}`);
    };

    const handleEliminar = (id_usuario) => {
        setConfirmId(id_usuario); // Abre el modal de confirmación
    };

    const cancelDeletion = () => {
        setConfirmId(null);
    };

    // FUNCIÓN DE ELIMINACIÓN
    const confirmDeletion = async () => {
        const idToDelete = confirmId;
        if (!idToDelete) return;

        setIsDeleting(true);
        setError(null); // Limpiar errores antes de intentar

        try {
            await usuarioService.eliminarUsuario(idToDelete);

            setUsuarios(usuarios.filter(u => u.id_usuario !== idToDelete));
            console.log(`Usuario ${idToDelete} eliminado con éxito.`);

        } catch (err) {
            setError(`Error al eliminar el usuario: ${err.message}`);
            console.error("Error de eliminación:", err);
        } finally {
            setIsDeleting(false);
            cancelDeletion(); // Cierra el modal de confirmación
        }
    };

    // ---------------------------------
    // Componentes de Renderizado
    // ---------------------------------

    const usuarioToDelete = usuarios.find(u => u.id_usuario === confirmId);

    // Visualización del error detallado
    const ErrorDisplay = () => (
        <div className="p-4 text-center text-red-700 font-semibold border border-red-300 bg-red-100 rounded-lg mx-auto max-w-lg mt-4">
            Error: {error}
        </div>
    );

    const UsuarioRow = ({ usuario }) => {
        const estadoClase = usuario.estado === 'activo' ? 'text-green-600 font-bold' : 'text-red-600';

        return (
            <tr className="border-b border-gray-100 hover:bg-indigo-50 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.id_usuario}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.dni}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.apellido}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.telefono || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{usuario.email || 'N/A'}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${estadoClase}`}>{usuario.estado.toUpperCase()}</td>

                {/* Celda de Acciones (CORREGIDA: Botones de texto con estilo Tailwind) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                        onClick={() => handleModificar(usuario.id_usuario)}
                        className="text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-600 px-3 py-1 rounded-lg text-xs font-semibold transition duration-200 disabled:opacity-50"
                        aria-label={`Modificar a ${usuario.nombre}`}
                        disabled={isDeleting}
                    >
                        Modificar
                    </button>
                    <button
                        onClick={() => handleEliminar(usuario.id_usuario)}
                        className="text-red-600 hover:text-white hover:bg-red-600 border border-red-600 px-3 py-1 rounded-lg text-xs font-semibold transition duration-200 disabled:opacity-50"
                        aria-label={`Eliminar a ${usuario.nombre}`}
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

    if (loading) {
        return <div className="p-4 text-center text-indigo-600 font-semibold">Cargando datos de usuarios...</div>;
    }

    if (usuarios.length === 0) {
        return <div className="p-4 text-center text-gray-500 font-semibold">No se encontraron usuarios registrados.</div>;
    }

    return (
        <div className="relative">
            {error && <ErrorDisplay />}
            <div className="shadow-2xl bg-white rounded-xl overflow-hidden mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-600 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">DNI</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Apellido</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {usuarios.map(usuario => (
                            <UsuarioRow key={usuario.id_usuario} usuario={usuario} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            {confirmId && usuarioToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-700 mb-6">
                            ¿Está seguro de que desea eliminar al usuario: <span className="font-bold text-red-500">{usuarioToDelete.nombre} {usuarioToDelete.apellido}</span> (ID: {confirmId})?
                            Esta acción no se puede deshacer.
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

export default UsuarioTable;