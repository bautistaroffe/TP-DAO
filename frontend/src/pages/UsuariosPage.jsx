import React from 'react';
import UsuarioTable from '../components/tables/UsuarioTable.jsx';

export default function UsuariosPage() {


    return (
        // Utilizamos la clase 'container' que ya tienes definida en tu CSS
        <div className="container home-page">

            {/* Componente de la Tabla de Usuarios */}
            <UsuarioTable />

        </div>
    );
}