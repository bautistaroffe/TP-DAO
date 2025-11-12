// src/components/CanchaForm.jsx

import React, { useState, useEffect } from 'react';

// --- CONFIGURACIÓN DE REGLAS Y OPCIONES ---
const TIPOS_CANCHA = ['Fútbol', 'Pádel', 'Básquet'];
const MAX_NOMBRE_LENGTH = 25;

// Nuevas constantes para selectores
const BOOLEAN_OPTIONS = ['SI', 'NO'];
const ESTADO_OPTIONS = ['Activa', 'Inactiva'];

const OPCIONES_POR_TIPO = {
    'Fútbol': {
        superficies: ['Sintético', 'Cemento'],
        tamaños: ['7', '5'],
        requiereTamaño: true,
    },
    'Pádel': {
        superficies: ['Sintético', 'Cemento'],
        tamaños: [],
        requiereTamaño: false,
    },
    'Básquet': {
        superficies: ['Cemento', 'Madera'],
        tamaños: ['3', '5'],
        requiereTamaño: true,
    },
};

export default function CanchaForm({ initialData = null, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: TIPOS_CANCHA[0],
    superficie: '',
    tamaño: '',
    // Valores iniciales como string para selectores SI/NO
    techada: 'NO',
    iluminacion: 'NO',
    estado: ESTADO_OPTIONS[0], // 'Activa'
    precio_base: 0,
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!initialData && !!initialData.id_cancha;
  const currentOptions = OPCIONES_POR_TIPO[formData.tipo] || {};

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        tipo: initialData.tipo || TIPOS_CANCHA[0],
        superficie: initialData.superficie || '',
        tamaño: initialData.tamaño || '',
        // Conversión de BOOLEAN (backend) a STRING (formulario)
        techada: initialData.techada ? 'SI' : 'NO',
        iluminacion: initialData.iluminacion ? 'SI' : 'NO',
        estado: ESTADO_OPTIONS.includes(initialData.estado) ? initialData.estado : ESTADO_OPTIONS[0],
        precio_base: initialData.precio_base || 0,
      });
    }
  }, [initialData]);

  // --- Manejadores de Estado ---

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Lógica para resetear campos condicionales al cambiar el tipo
    if (name === 'tipo') {
        const newOptions = OPCIONES_POR_TIPO[value];
        setFormData(prev => ({
            ...prev,
            [name]: value,
            superficie: newOptions.superficies.includes(prev.superficie) ? prev.superficie : '',
            tamaño: newOptions.requiereTamaño ? '' : 'N/A'
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // --- Lógica de Validación ---

  const validate = () => {
    let newErrors = {};

    // 1. Nombre y Precio (validaciones base)
    if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es obligatorio.';
    } else if (formData.nombre.length > MAX_NOMBRE_LENGTH) {
        newErrors.nombre = `El nombre no puede exceder los ${MAX_NOMBRE_LENGTH} caracteres.`;
    }
    if (formData.precio_base <= 0) newErrors.precio_base = 'El precio base debe ser mayor a 0.';

    // 2. Superficie y Tamaño (Validación condicional)
    if (!formData.superficie || !currentOptions.superficies.includes(formData.superficie)) {
        newErrors.superficie = 'Debe seleccionar una superficie válida.';
    }
    if (currentOptions.requiereTamaño) {
        if (!formData.tamaño || !currentOptions.tamaños.includes(formData.tamaño)) {
            newErrors.tamaño = 'Debe seleccionar un tamaño válido.';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Manejo del Envío y Conversión Final ---
    const normalizeString = (str) => {
        if (!str) return str;
        // Convierte a minúsculas y elimina el acento de 'ó' si existiera (ej. Fútbol -> Futbol)
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // 1. Conversión de string 'SI'/'NO' a booleanos para el DTO
      // 2. Ajuste del campo tamaño (null si no es requerido)
      const dataToSend = {
          ...formData,
          tamaño: currentOptions.requiereTamaño ? formData.tamaño : null,
          techada: formData.techada === 'SI', // Conversión clave para el backend
          iluminacion: formData.iluminacion === 'SI', // Conversión clave para el backend
          tipo: normalizeString(formData.tipo),
          estado: normalizeString(formData.estado),

          // También normaliza superficie si tu backend lo exige
          superficie: normalizeString(formData.superficie),
      };

      onSubmit({
        ...dataToSend,
        ...(isEditing && { id_cancha: initialData.id_cancha })
      });
    }
  };

  // --- Renderizado ---

  return (
    <div className="app-form-container">
      <h3>{isEditing ? `Modificar Cancha ID: ${initialData.id_cancha}` : 'Agregar Nueva Cancha'}</h3>

      <form onSubmit={handleSubmit}>

        {/* FILA 1: Nombre y Tipo */}
        <div className="form-group-row">
            <div className="form-field">
              <label htmlFor="nombre">Nombre/Descripción:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                maxLength={MAX_NOMBRE_LENGTH}
              />
              <small>{formData.nombre.length}/{MAX_NOMBRE_LENGTH}</small>
              {errors.nombre && <p className="error">{errors.nombre}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="tipo">Tipo de Cancha:</label>
              <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
                {TIPOS_CANCHA.map(tipo => (
                    <option key={tipo} value={tipo}>
                        {tipo}
                    </option>
                ))}
              </select>
              {errors.tipo && <p className="error">{errors.tipo}</p>}
            </div>
        </div>

        {/* FILA 2: Superficie y Tamaño (Dinámicos) */}
        <div className="form-group-row">

            <div className="form-field">
              <label htmlFor="superficie">Superficie:</label>
              <select id="superficie" name="superficie" value={formData.superficie} onChange={handleChange}>
                <option value="" disabled>Seleccionar superficie</option>
                {currentOptions.superficies && currentOptions.superficies.map(sup => (
                    <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
              {errors.superficie && <p className="error">{errors.superficie}</p>}
            </div>

            {currentOptions.requiereTamaño && (
                <div className="form-field">
                    <label htmlFor="tamaño">Tamaño:</label>
                    <select id="tamaño" name="tamaño" value={formData.tamaño} onChange={handleChange}>
                        <option value="" disabled>Seleccionar tamaño</option>
                        {currentOptions.tamaños && currentOptions.tamaños.map(tam => (
                            <option key={tam} value={tam}>{tam}</option>
                        ))}
                    </select>
                    {errors.tamaño && <p className="error">{errors.tamaño}</p>}
                </div>
            )}

            {!currentOptions.requiereTamaño && <div className="form-field"></div>}
        </div>

        {/* FILA 3: Techada e Iluminación (Nuevos Selectores) */}
        <div className="form-group-row">
            <div className="form-field">
                <label htmlFor="techada">Techada:</label>
                <select id="techada" name="techada" value={formData.techada} onChange={handleChange}>
                    {BOOLEAN_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
            <div className="form-field">
                <label htmlFor="iluminacion">Iluminación:</label>
                <select id="iluminacion" name="iluminacion" value={formData.iluminacion} onChange={handleChange}>
                    {BOOLEAN_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        </div>


        {/* FILA 4: Precio Base y Estado (Adaptados) */}
        <div className="form-group-row">
            <div className="form-field">
              <label htmlFor="precio_base">Precio Base por Turno (en $):</label>
              <input
                type="number"
                id="precio_base"
                name="precio_base"
                value={formData.precio_base}
                onChange={handleChange}
                min="0.01"
                step="0.01"
              />
              {errors.precio_base && <p className="error">{errors.precio_base}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="estado">Estado:</label>
              <select id="estado" name="estado" value={formData.estado} onChange={handleChange}>
                {ESTADO_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
        </div>

        {/* Botones de Acción */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isEditing ? 'Guardar Cambios' : 'Registrar Cancha'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}