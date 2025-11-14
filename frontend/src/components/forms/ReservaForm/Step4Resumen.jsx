import React from 'react';

const formatTurno = (turno) => {
    if (!turno || !turno.fecha || !turno.hora_inicio || !turno.hora_fin) {
        return 'Turno no disponible';
    }
    const horaInicio = turno.hora_inicio.substring(0, 5);
    const horaFin = turno.hora_fin.substring(0, 5);
    const [year, month, day] = turno.fecha.split('-');
    return `${day}/${month} de ${horaInicio} a ${horaFin}`;
};

/**
 * Componente para el Paso 4: Resumen de la Reserva y Selección de Pago.
 * @param {object} props - Propiedades recibidas desde ReservaForm.jsx
 * @param {object} props.canchaSeleccionada - DTO de la cancha.
 * @param {object} props.userData - DTO del usuario encontrado/a crear.
 * @param {object} props.formData - Datos del formulario (incluye metodo_pago).
 * @param {function} props.handleChange - Función para manejar cambios (solo para metodo_pago).
 * @param {number} props.costoBaseCancha - Costo base.
 * @param {number} props.costoServicios - Costo total de adicionales.
 * @param {number} props.costoTotal - Monto total final.
 * @param {Array<object>} props.turnos - Lista completa de turnos para buscar.
 */
const Step4Resumen = ({
    canchaSeleccionada,
    userData,
    formData,
    handleChange,
    costoBaseCancha,
    costoServicios,
    costoTotal,
    turnos
}) => {

    // Buscar el turno seleccionado para el display legible
    const turnoSeleccionado = turnos.find(t => t.id_turno === formData.id_turno);

    // Contar cuántos servicios fueron seleccionados
    const totalServiciosSeleccionados = Object.values(formData.servicios_adicionales)
        .filter(val => val > 0 || val === true)
        .length;

    if (!canchaSeleccionada || !turnoSeleccionado || !userData) {
        return (
            <div className="text-center p-4 border border-red-300 rounded-md bg-red-50 text-red-700">
                <p>⛔ **Error:** Falta información clave (Cancha, Turno o Cliente) para generar el resumen.</p>
                <p className='text-sm mt-1'>Por favor, vuelva a los pasos anteriores.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-indigo-700">4. Resumen y Pago</h3>

            {/* Detalle de la Reserva */}
            <div className="border p-4 rounded-lg bg-indigo-50 border-indigo-200">
                <h4 className="font-bold text-lg mb-2 text-indigo-800 border-b pb-1">Detalle de la Reserva</h4>
                <p><strong>Cancha:</strong> {canchaSeleccionada.nombre} ({canchaSeleccionada.tipo})</p>
                <p><strong>Turno:</strong> {formatTurno(turnoSeleccionado)}</p>
                <p><strong>Cliente:</strong> {userData.nombre} {userData.apellido} (DNI: {userData.dni})</p>
            </div>

            {/* Resumen de Costos */}
            <div className="border p-4 rounded-lg shadow-inner bg-white">
                <h4 className="font-bold text-lg mb-2">Cálculo de Monto</h4>
                <div className="space-y-1 text-gray-700">
                    <p className="flex justify-between">
                        <span>Precio Base Cancha:</span>
                        <span className="font-mono font-semibold">${costoBaseCancha.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between border-b pb-2">
                        <span>Servicios Adicionales ({totalServiciosSeleccionados} ítems):</span>
                        <span className="font-mono font-semibold">${costoServicios.toFixed(2)}</span>
                    </p>
                </div>

                <p className="flex justify-between font-extrabold text-2xl text-green-700 pt-3">
                    <span>MONTO TOTAL A PAGAR:</span>
                    <span>${costoTotal.toFixed(2)}</span>
                </p>
            </div>

            {/* Selección de Método de Pago */}
            <div className="space-y-3 pt-3">
                <h4 className="font-medium text-gray-800">Método de Pago</h4>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">

                    {/* Opción 1: Efectivo */}
                    <label className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer flex-1 ${formData.metodo_pago === 'efectivo' ? 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-500' : 'bg-white border-gray-300'}`}>
                        <input
                            type="radio"
                            name="metodo_pago"
                            value="efectivo"
                            checked={formData.metodo_pago === 'efectivo'}
                            onChange={handleChange}
                            className="h-5 w-5 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                        />
                        <div className='flex flex-col'>
                            <span className="font-semibold text-sm">Efectivo</span>
                            <span className="text-xs text-gray-500">Se registra la reserva y se paga al momento de usarla.</span>
                        </div>
                    </label>

                    {/* Opción 2: Mercado Pago */}
                    <label className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer flex-1 ${formData.metodo_pago === 'mercado_pago' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-300'}`}>
                        <input
                            type="radio"
                            name="metodo_pago"
                            value="mercado_pago"
                            checked={formData.metodo_pago === 'mercado_pago'}
                            onChange={handleChange}
                            className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className='flex flex-col'>
                            <span className="font-semibold text-sm">Mercado Pago</span>
                            <span className="text-xs text-gray-500">Pago online. Se requiere pago **inmediato** para confirmar.</span>
                        </div>
                    </label>
                </div>
            </div>

        </div>
    );
};

export default Step4Resumen;