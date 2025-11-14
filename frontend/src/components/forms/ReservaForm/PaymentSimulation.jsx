import React, { useState, useEffect } from 'react';

/**
 * Componente que simula la pasarela de pago y muestra la confirmación.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.data - Datos de la transacción (reservaId, monto, clienteNombre, clienteEmail).
 * @param {function} props.onPaymentComplete - Callback para finalizar el proceso.
 */
const PaymentSimulation = ({ data, onPaymentComplete }) => {
    const [status, setStatus] = useState('loading'); // 'loading' o 'confirmed'

    // Simula el tiempo que lleva procesar el pago
    useEffect(() => {
        const timer = setTimeout(() => {
            // Después de 3 segundos, simulamos la confirmación exitosa
            setStatus('confirmed');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleAceptar = () => {
        // Ejecuta el callback que cierra el formulario principal
        onPaymentComplete();
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-indigo-50 min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">Simulando Pasarela de Pago</h3>
                <p className="text-gray-600">Conectando con Mercado Pago...</p>
                <p className="text-sm mt-4 text-gray-500">Esto puede tomar unos segundos.</p>
            </div>
        );
    }

    // Pantalla de Confirmación
    return (
        <div className="p-8 bg-white rounded-xl shadow-2xl">
            <div className="text-center">

                {/* 🟢 IMAGEN DEL LOGO DE LA EMPRESA */}
                <img
                    src="/logoMP.png"
                    alt="Logo del Complejo"
                    className="w-12 h-12 mx-auto mb-4 rounded-full shadow-lg"
                />

                {/* ❌ ICONO SVG ELIMINADO */}

                <h3 className="text-3xl font-extrabold text-green-700 mb-2">¡Pago Confirmado!</h3>
                <p className="text-gray-600 mb-2">
                    Tu reserva ha sido pagada y confirmada exitosamente.
                </p>
                {/* Mensaje de correo */}
                {data.clienteEmail && (
                     <p className="text-sm font-semibold text-indigo-500">
                        Se ha enviado el comprobante a: **{data.clienteEmail}**
                    </p>
                )}
            </div>

            <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 space-y-2 mt-6">
                <p className="flex justify-between font-medium text-gray-700">
                    <span>Cliente:</span>
                    <span className="font-semibold text-right">{data.clienteNombre}</span>
                </p>
                <p className="flex justify-between font-medium text-gray-700">
                    <span>ID de Reserva:</span>
                    <span className="font-mono text-indigo-600 text-right">{data.reservaId}</span>
                </p>
                <p className="flex justify-between text-2xl font-bold text-green-600 pt-2 border-t mt-2">
                    <span>Monto Pagado:</span>
                    <span className="text-right">${data.monto.toFixed(2)}</span>
                </p>
            </div>

            <div className="text-center mt-6">
                <button
                    onClick={handleAceptar}
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150"
                >
                    Aceptar y Volver
                </button>
            </div>
        </div>
    );
};

export default PaymentSimulation;