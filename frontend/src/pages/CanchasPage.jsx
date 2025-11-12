// src/pages/CanchasPage.jsx

import React from 'react';
import CanchaTable from '../components/tables/CanchaTable.jsx'; // Asegúrate de que la ruta sea correcta

export default function CanchasPage() {

    // Función de acción para el botón Agregar
    const handleAgregarCancha = () => {
        console.log("Navegar o abrir modal para Agregar nueva Cancha");
    };

    return (
        // La clase 'container' centraliza el contenido según tu CSS
        <div className="container home-page p-4">

            <h1 className="text-3xl font-bold mb-6">🛠️ Gestión de Canchas</h1>

            {/* Bloque de Acciones con el botón Agregar */}
            <div className="home-actions mb-6 text-left">
                <button
                    onClick={handleAgregarCancha}
                    // Usando clases de Tailwind para un botón verde y moderno
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    + Agregar Cancha
                </button>
            </div>

            {/* Componente de la Tabla de Canchas */}
            <CanchaTable />

        </div>
    );
}