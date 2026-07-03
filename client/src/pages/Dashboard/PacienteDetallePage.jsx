import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { editConfig } from "../config/editConfig";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getClienteByIdRequest } from "/src/api/clientes";
import { getPacienteByOwnerRequest } from "/src/api/pacientes";
import { createPacienteRequest } from "/src/api/pacientes";
import { getPacienteByIdRequest } from "/src/api/pacientes";
import { getInternadosByPacienteRequest, createInternadoRequest, updateInternadoRequest, deleteInternadoRequest } from "/src/api/internados";
import { getHistorialByPacienteRequest } from "/src/api/historialClinico";
import { getCitasByPacienteRequest } from "/src/api/cita";
import { useAuth } from "../../hooks/useAuth";
import { useEdit } from "../../hooks/useEdit";
import { toast } from 'sonner';

function PacienteDetallePage() {
    const { user } = useAuth(); 
    const navigate = useNavigate();
    const { id } = useParams();
    const [paciente, setPaciente] = useState(null);
    const [dueno, setDueno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [internados, setInternados] = useState([]);
    const [mostrarFormInternado, setMostrarFormInternado] = useState(false);
    const [internadoSeleccionado, setInternadoSeleccionado] = useState(null);
    const [historialCompleto, setHistorialCompleto] = useState([]);
    const [historialLoading, setHistorialLoading] = useState(false);
    const [citasFuturas, setCitasFuturas] = useState([]);
    const [citasLoading, setCitasLoading] = useState(false);

    const isAdmin = user?.role === 'admin';
    const isDoctor = user?.role === 'doctor';
    const isClient = user?.role === 'client';
    const canAddInternado = isAdmin || isDoctor;

    // Función para cargar todos los datos
    const cargarTodosLosDatos = async () => {
        setLoading(true);
        try {
            const pacienteRes = await getPacienteByIdRequest(id);
            setPaciente(pacienteRes.data);
            
            if (pacienteRes.data.ownerId) {
                setDueno(pacienteRes.data.ownerId);           
            }
            
            const internadosRes = await getInternadosByPacienteRequest(id);
            setInternados(internadosRes.data);
            
            await cargarHistorialCompleto();
            await cargarCitasFuturas();
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar historial clínico completo del paciente
    const cargarHistorialCompleto = async () => {
        if (!id) return;
        
        setHistorialLoading(true);
        try {
            console.log('🔍 Cargando historial clínico para paciente:', id);
            const res = await getHistorialByPacienteRequest(id);
            console.log('✅ Historial clínico cargado:', res.data);
            setHistorialCompleto(res.data.data || []);
        } catch (error) {
            console.error('❌ Error cargando historial clínico:', error);
            if (error.response?.status !== 404) {
                manejarErrorResponse(error, setErrors, setSuccessMessage);
            }
            setHistorialCompleto([]);
        } finally {
            setHistorialLoading(false);
        }
    };

    // Función para cargar citas futuras
    const cargarCitasFuturas = async () => {
        if (!id) return;
        
        setCitasLoading(true);
        try {
            const res = await getCitasByPacienteRequest(id);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const futuras = res.data.filter(cita => new Date(cita.fecha) >= hoy && cita.estado !== 'cancelada');
            setCitasFuturas(futuras);
        } catch (error) {
            console.error('Error cargando citas futuras:', error);
            setCitasFuturas([]);
        } finally {
            setCitasLoading(false);
        }
    };

    // Función para formatear fechas
    const formatearFechaLocal = (fecha) => {
        if (!fecha) return 'No especificada';
        
        if (typeof fecha === 'string' && fecha.includes('-')) {
            const [year, month, day] = fecha.split('-');
            return `${day}/${month}/${year}`;
        }
        
        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-CR', {
                timeZone: 'America/Costa_Rica',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'No especificada';
        }
    };

    // Función para formatear fecha y hora
    const formatearFechaHora = (fechaISO) => {
        if (!fechaISO) return 'No especificada';
        const date = new Date(fechaISO);
        return date.toLocaleDateString('es-CR', {
            timeZone: 'America/Costa_Rica',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Hook para editar internados
    const {
        showForm: showEditInternadoForm,
        errors: editErrors,
        successMessage: editSuccessMessage,
        handleEdit: handleEditInternado,
        handleUpdate: handleUpdateInternado,
        handleCancel: handleCancelEditInternado
    } = useEdit(
        updateInternadoRequest,
        getInternadosByPacienteRequest,
        setInternados,
        editConfig.editInternado,
        id
    );

    const handleEditInternadoWithSelection = (internado) => {
        setInternadoSeleccionado(internado);
        handleEditInternado(internado);
    };

    const handleDeleteInternado = async (internadoId, internadoFecha) => {
        if (!window.confirm(`¿Estás seguro de eliminar el internado del ${formatearFechaLocal(internadoFecha)}?`)) return;
        
        try {
            await deleteInternadoRequest(internadoId);
            await cargarTodosLosDatos();
            toast.success('Internado eliminado exitosamente');
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
            toast.error('Error al eliminar el internado');
        }
    };

    const handleUpdateInternadoConRecarga = async (data) => {
        try {
            await updateInternadoRequest(internadoSeleccionado._id, data);
            await cargarTodosLosDatos();
            handleCancelEditInternado();
            toast.success('Internado actualizado exitosamente');
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
            toast.error('Error al actualizar el internado');
        }
    };

    useEffect(() => {
        if (id) {
            cargarTodosLosDatos();
        }
    }, [id]);

    const handleCrearInternado = async (data) => {
        try {
            const datosEnvio = {
                ...data,
                pacienteId: id,
                fechaIngreso: data.fechaIngreso || '',
                fechaEgreso: data.fechaEgreso || ''
            };
            
            await createInternadoRequest(datosEnvio);
            setMostrarFormInternado(false);
            await cargarTodosLosDatos();
            toast.success('Internado creado exitosamente');
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
            toast.error('Error al crear el internado');
        }
    };

    // Función para obtener estado de la cita con color
    const obtenerEstadoCita = (estado) => {
        const estados = {
            'pendiente': 'Pendiente de confirmación',
            'confirmada': 'Confirmada',
            'cancelada': 'Cancelada',
            'completada': 'Completada'
        };
        return estados[estado] || estado;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/pacientes')}
                className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver a Pacientes
            </button>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            )}

            {!loading && !paciente && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">Paciente no encontrado</p>
                    <button
                        onClick={() => navigate('/pacientes')}
                        className="mt-4 text-cyan-600 hover:text-cyan-700"
                    >
                        Volver a la lista
                    </button>
                </div>
            )}

            {!loading && paciente && (
                <>
                    <InfoCard
                        title={`Información de ${paciente.nombre}`}
                        data={[
                            { label: "Nombre", value: paciente.nombre },
                            { label: "Especie", value: paciente.especie },
                            { label: "Raza", value: paciente.raza || 'Sin raza' },
                            { label: "Edad", value: paciente.edad ? `${paciente.edad} años` : 'No especificada' },
                            { label: "Sexo", value: paciente.sexo || 'No especificado' },
                            { label: "Color Pelaje", value: paciente.colorPelaje || 'No especificado' },
                            { label: "Peso", value: paciente.peso ? `${paciente.peso.valor} ${paciente.peso.unidad}` : 'No especificado' },
                            { label: "Antecedentes Médicos", value: paciente.antecedentesMedicos || 'No especificados' },
                        ]}
                    />

                    {dueno && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">Dueño de {paciente.nombre}</h3>
                            <InfoCard
                                title={`${dueno.username} ${dueno.lastname}`}
                                data={[
                                    { label: "Nombre completo", value: `${dueno.username} ${dueno.lastname}` },
                                    { label: "Email", value: dueno.email },
                                    { label: "Teléfono", value: dueno.phoneNumber },
                                    { label: "Cédula", value: dueno.cedula },
                                    { label: "Dirección", value: dueno.direccion },
                                ]}
                            />
                        </div>
                    )}
                    
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Historial de Internados</h3>
                            {canAddInternado && (
                                <button
                                    onClick={() => setMostrarFormInternado(true)}
                                    className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition"
                                >
                                    Agregar Internado
                                </button>
                            )}
                        </div>

                        {mostrarFormInternado && canAddInternado && (
                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg md:text-xl font-semibold text-gray-700">Crear Nuevo Internado</h2>
                                    <button
                                        onClick={() => setMostrarFormInternado(false)}
                                        className="text-gray-400 hover:text-gray-600 transition text-xl"
                                        aria-label="Cerrar"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <DynamicForm
                                    {...createConfig.internado}
                                    layout="grid"
                                    defaultValues={{ pacienteId: id }}
                                    onSubmit={handleCrearInternado}
                                    errors={errors}
                                    successMessage={successMessage}
                                />
                            </div>
                        )}

                        {showEditInternadoForm && canAddInternado && (
                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg md:text-xl font-semibold text-gray-700">Editar Internado</h2>
                                    <button
                                        onClick={handleCancelEditInternado}
                                        className="text-gray-400 hover:text-gray-600 transition text-xl"
                                        aria-label="Cerrar"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <DynamicForm
                                    {...editConfig.editInternado}
                                    layout="grid"
                                    defaultValues={{
                                        fechaIngreso: internadoSeleccionado?.fechaIngreso?.split('T')[0] || '',
                                        fechaEgreso: internadoSeleccionado?.fechaEgreso?.split('T')[0] || '',
                                        medicamento: internadoSeleccionado?.medicamento || '',
                                        via: internadoSeleccionado?.via || '',
                                        dosis: internadoSeleccionado?.dosis || '',
                                        notas: internadoSeleccionado?.notas || ''
                                    }}
                                    onSubmit={handleUpdateInternadoConRecarga}
                                    errors={editErrors}
                                    successMessage={editSuccessMessage}
                                />
                            </div>
                        )}

                        {internados.length === 0 ? (
                            <p className="text-gray-500">No hay internados registrados</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {internados.map((internado) => (
                                    <div key={internado._id} className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col min-h-[200px]">
                                        <div className="p-5 pb-20 flex-1">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                                Internado {formatearFechaLocal(internado.fechaIngreso)}
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Fecha Ingreso:</span>
                                                    <span className="font-medium text-gray-700">{formatearFechaLocal(internado.fechaIngreso)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Fecha Egreso:</span>
                                                    <span className="font-medium text-gray-700">{formatearFechaLocal(internado.fechaEgreso) || 'En curso'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Medicamento:</span>
                                                    <span className="font-medium text-gray-700">{internado.medicamento || 'No especificado'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Vía:</span>
                                                    <span className="font-medium text-gray-700">{internado.via || 'No especificada'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Dosis:</span>
                                                    <span className="font-medium text-gray-700">{internado.dosis || 'No especificada'}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-gray-500">Notas:</span>
                                                    <span className="font-medium text-gray-700 break-words whitespace-normal">
                                                        {internado.notas || 'Sin notas'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {canAddInternado && (
                                            <div className="absolute bottom-3 right-3 flex gap-2">
                                                <button
                                                    onClick={() => handleEditInternadoWithSelection(internado)}
                                                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                                                >
                                                    Actualizar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteInternado(internado._id, internado.fechaIngreso)}
                                                    className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-sm"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ========================================== */}
                    {/* PRÓXIMAS CITAS AGENDADAS */}
                    {/* ========================================== */}
                    <div className="mt-10">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Próximas citas agendadas</h3>
                        
                        {citasLoading ? (
                            <div className="flex justify-center items-center h-20">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : citasFuturas.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-gray-500">No hay citas programadas para esta mascota</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {citasFuturas.map((cita) => (
                                    <div key={cita._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-wrap items-center justify-between hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {formatearFechaLocal(cita.fecha)}
                                            </div>
                                            <span className="text-gray-700">{cita.horaInicio} - {cita.horaFin}</span>
                                            <span className="text-gray-600">{cita.doctorId?.username || 'Veterinario'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                                                cita.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                                                cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                {obtenerEstadoCita(cita.estado)}
                                            </span>
                                            <button 
                                                onClick={() => navigate(`/citas/${cita._id}`)}
                                                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                                            >
                                                Ver detalles →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ========================================== */}
                    {/* HISTORIAL CLÍNICO COMPLETO - EXPEDIENTE */}
                    {/* ========================================== */}
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Historial Clínico</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Registro completo de todas las consultas médicas de {paciente.nombre}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    {historialCompleto.length} consultas registradas
                                </span>
                            </div>
                        </div>

                        {historialLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : historialCompleto.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="text-5xl mb-4">📋</div>
                                <p className="text-gray-500 text-lg">No hay consultas registradas para esta mascota</p>
                                <p className="text-gray-400 text-sm mt-2">Las consultas se registran automáticamente al completar una cita</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {historialCompleto.map((registro, index) => {
                                    const cita = registro.citaId || {};
                                    const fechaCita = cita.fecha || registro.createdAt;
                                    const nombreDoctor = cita.doctorId?.username || 'Veterinario asignado';
                                    
                                    return (
                                        <div key={registro._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                            {/* Encabezado */}
                                            <div className="border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 flex flex-wrap items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-semibold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                                                        Consulta #{index + 1}
                                                    </span>
                                                    <h4 className="text-lg font-semibold text-gray-800">
                                                        {formatearFechaHora(fechaCita)}
                                                    </h4>
                                                    {cita.horaInicio && (
                                                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                                                            🕐 {cita.horaInicio}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                                                        {nombreDoctor}
                                                    </span>
                                                    {cita.estado && (
                                                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                                                            cita.estado === 'completada' ? 'bg-green-100 text-green-700' :
                                                            cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-700' :
                                                            cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {obtenerEstadoCita(cita.estado)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contenido */}
                                            <div className="p-6">
                                                <div className="space-y-4">
                                                    {/* Motivo */}
                                                    <div className="border-l-4 border-cyan-500 pl-4">
                                                        <p className="text-sm text-gray-500">Motivo de la consulta</p>
                                                        <p className="text-gray-800 font-medium">{registro.motivoConsulta || 'No especificado'}</p>
                                                    </div>

                                                    {/* Síntomas y Diagnóstico */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Síntomas reportados</p>
                                                            <p className="text-gray-800 mt-1">{registro.sintomas || 'No reportados'}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Diagnóstico</p>
                                                            <p className="text-gray-800 mt-1 font-medium">{registro.diagnostico || 'No especificado'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Tratamiento */}
                                                    {registro.tratamiento && (
                                                        <div className="border-l-4 border-blue-500 pl-4">
                                                            <p className="text-sm text-gray-500">Tratamiento indicado</p>
                                                            <p className="text-gray-800">{registro.tratamiento}</p>
                                                        </div>
                                                    )}

                                                    {/* Medicamentos */}
                                                    {registro.medicamentos && registro.medicamentos.length > 0 && (
                                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                            <p className="text-sm font-medium text-blue-700 mb-2">💊 Medicamentos recetados</p>
                                                            <ul className="space-y-1">
                                                                {registro.medicamentos.map((m, i) => (
                                                                    <li key={i} className="text-gray-700 text-sm">
                                                                        • {m.nombre}{m.dosis && ` (${m.dosis})`}{m.frecuencia && ` — cada ${m.frecuencia}`}{m.duracion && ` durante ${m.duracion}`}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Exámenes */}
                                                    {registro.examenes && registro.examenes.length > 0 && (
                                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                                            <p className="text-sm font-medium text-purple-700 mb-2">🔬 Exámenes realizados</p>
                                                            <ul className="space-y-1">
                                                                {registro.examenes.map((e, i) => (
                                                                    <li key={i} className="text-gray-700 text-sm">
                                                                        • {e.nombre}{e.resultado && `: ${e.resultado}`}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Observaciones */}
                                                    {registro.observaciones && (
                                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                                            <p className="text-sm font-medium text-amber-700 mb-1">📝 Observaciones del veterinario</p>
                                                            <p className="text-gray-700 whitespace-pre-wrap">{registro.observaciones}</p>
                                                        </div>
                                                    )}

                                                    {/* Próxima cita sugerida */}
                                                    {registro.proximaCitaSugerida && (
                                                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                                                            <span className="text-green-600 text-sm font-medium">📅 Próxima cita sugerida:</span>
                                                            <span className="text-gray-800 font-medium">{formatearFechaHora(registro.proximaCitaSugerida)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default PacienteDetallePage;