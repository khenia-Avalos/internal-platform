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
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
        } finally {
            setLoading(false);
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
                </>
            )}
        </div>
    );
}

export default PacienteDetallePage;