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
import { getCitasByPacienteRequest } from "/src/api/cita";
import { getHistorialByPacienteRequest } from "/src/api/historialClinico";
import { useAuth } from "../../hooks/useAuth";
import { useEdit } from "../../hooks/useEdit";
import { toast } from 'sonner';
import { DataTable } from "../../components/DataTable";

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
    const [citas, setCitas] = useState([]);
    const [citasLoading, setCitasLoading] = useState(false);
    const [historialCompleto, setHistorialCompleto] = useState([]);
    const [historialLoading, setHistorialLoading] = useState(false);

    const isAdmin = user?.role === 'admin';
    const isDoctor = user?.role === 'doctor';
    const isClient = user?.role === 'client';
    const canAddInternado = isAdmin || isDoctor;

    // Funcion para formatear fechas
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
            
            await cargarCitasPaciente();
            await cargarHistorialCompleto();
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar citas del paciente
    const cargarCitasPaciente = async () => {
        if (!id) return;
        
        setCitasLoading(true);
        try {
            const citasRes = await getCitasByPacienteRequest(id);
            const citasOrdenadas = citasRes.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            setCitas(citasOrdenadas);
        } catch (error) {
            console.error("Error cargando citas del paciente:", error);
            manejarErrorResponse(error, setErrors, setSuccessMessage);
        } finally {
            setCitasLoading(false);
        }
    };

    // Función para cargar historial clínico completo
    const cargarHistorialCompleto = async () => {
        if (!id) return;
        
        setHistorialLoading(true);
        try {
            const res = await getHistorialByPacienteRequest(id);
            setHistorialCompleto(res.data || []);
        } catch (error) {
            console.error("Error cargando historial completo:", error);
            // Si no existe, no mostrar error
            if (error.response?.status !== 404) {
                manejarErrorResponse(error, setErrors, setSuccessMessage);
            }
        } finally {
            setHistorialLoading(false);
        }
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

    // Función para obtener el estado con color
    const obtenerEstadoCita = (estado) => {
        const estados = {
            'pendiente': 'Pendiente',
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
                    
                    {/* ============================================ */}
                    {/* SECCIÓN DE INTERNADOS */}
                    {/* ============================================ */}
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

                    {/* ============================================ */}
                    {/* SECCIÓN DE CITAS */}
                    {/* ============================================ */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Citas Registradas</h3>
                        
                        {citasLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : citas.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No hay citas registradas para esta mascota</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                                <DataTable
                                    columns={[
                                        { header: "Fecha", accessor: "fecha", render: (cita) => formatearFechaHora(cita.fecha) },
                                        { header: "Hora", accessor: "horaInicio" },
                                        { header: "Título", accessor: "titulo", render: (cita) => cita.titulo || 'Sin título' },
                                        { header: "Doctor", accessor: "doctorId", render: (cita) => cita.doctorId?.username || 'No asignado' },
                                        { header: "Estado", accessor: "estado", render: (cita) => obtenerEstadoCita(cita.estado) }
                                    ]}
                                    data={citas}
                                    onRowClick={(cita) => navigate(`/citas/${cita._id}`)}
                                />
                            </div>
                        )}
                    </div>

                    {/* ============================================ */}
                    {/* SECCIÓN DE HISTORIAL CLÍNICO COMPLETO */}
                    {/* ============================================ */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Historial Clínico Completo</h3>
                        
                        {historialLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : historialCompleto.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No hay registros clínicos para esta mascota</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {historialCompleto.map((registro) => (
                                    <div key={registro._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-100">
                                            <h4 className="text-lg font-semibold text-gray-800">
                                                Registro del {formatearFechaLocal(registro.createdAt)}
                                            </h4>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                Cita: {registro.citaId?.titulo || 'Sin título'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Motivo de consulta</p>
                                                <p className="text-gray-800 font-medium">{registro.motivoConsulta || 'No especificado'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Síntomas reportados</p>
                                                <p className="text-gray-800 font-medium">{registro.sintomas || 'No especificados'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Diagnóstico</p>
                                                <p className="text-gray-800 font-medium">{registro.diagnostico || 'No especificado'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Tratamiento indicado</p>
                                                <p className="text-gray-800 font-medium">{registro.tratamiento || 'No especificado'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Medicamentos recetados</p>
                                                <p className="text-gray-800 font-medium">
                                                    {registro.medicamentos?.length > 0 
                                                        ? registro.medicamentos.map(m => `${m.nombre} (${m.dosis})`).join(', ')
                                                        : 'No especificados'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Exámenes realizados</p>
                                                <p className="text-gray-800 font-medium">
                                                    {registro.examenes?.length > 0
                                                        ? registro.examenes.map(e => `${e.nombre}: ${e.resultado}`).join(', ')
                                                        : 'No especificados'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Peso registrado</p>
                                                <p className="text-gray-800 font-medium">
                                                    {registro.pesoRegistrado?.valor 
                                                        ? `${registro.pesoRegistrado.valor} ${registro.pesoRegistrado.unidad || 'kg'}`
                                                        : 'No registrado'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Temperatura registrada</p>
                                                <p className="text-gray-800 font-medium">
                                                    {registro.temperaturaRegistrada 
                                                        ? `${registro.temperaturaRegistrada} °C`
                                                        : 'No registrada'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Próxima cita sugerida</p>
                                                <p className="text-gray-800 font-medium">
                                                    {registro.proximaCitaSugerida 
                                                        ? formatearFechaHora(registro.proximaCitaSugerida)
                                                        : 'No sugerida'}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2 lg:col-span-3">
                                                <p className="text-sm text-gray-500">Observaciones adicionales</p>
                                                <p className="text-gray-800 font-medium">{registro.observaciones || 'No especificadas'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default PacienteDetallePage;