import React from 'react';
// Asegúrate de que la ruta de importación a CanchaTable.jsx sea correcta
import TurnoTable from '../components/tables/TurnoTable.jsx';

export default function TurnosPage() {

    return (
        // Utilizamos la clase 'container' que ya tienes definida en tu CSS
        <div className="container home-page">

            {/* Componente de la Tabla de Turnos */}
            <TurnoTable />

        </div>
    );
}