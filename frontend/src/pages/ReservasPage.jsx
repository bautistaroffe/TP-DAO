import React from 'react';
import ReservaTable from '../components/tables/ReservaTable.jsx';

export default function ReservasPage() {

    // Función de acción para el botón Agregar
    const handleAgregarReserva = () => {
        console.log("Navegar o abrir modal para Agregar nueva Reserva");
    };

    return (
        // Utilizamos la clase 'container' que ya tienes definida en tu CSS
        <div className="container home-page">

            <h1 className="text-3xl font-bold mb-6">Gestión de reservas</h1>
            <p className="mb-6 text-gray-600">
                Aquí se listarán, crearán, editarán y eliminarán todas las reservas de tu complejo deportivo.
            </p>

            {/* Bloque de Acciones (Usa la clase 'home-actions' de tu CSS) */}
            <div className="home-actions mb-8">
                <button
                    onClick={handleAgregarReserva}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    + Agregar Reserva
                </button>
            </div>

            {/* Componente de la Tabla de pagos */}
            <ReservaTable />

        </div>
    );
}