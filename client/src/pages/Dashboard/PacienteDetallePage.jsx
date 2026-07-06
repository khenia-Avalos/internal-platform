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
import { getPacienteByIdRequest, marcarFallecidoRequest, reactivarPacienteRequest } from "/src/api/pacientes";
import { getInternadosByPacienteRequest, createInternadoRequest, updateInternadoRequest, deleteInternadoRequest } from "/src/api/internados";
import { getHistorialByPacienteRequest } from "/src/api/historialClinico";
import { getDocumentosByPacienteRequest, uploadDocumentoRequest, deleteDocumentoRequest, verDocumentoRequest } from "/src/api/documentos";
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
    
    // Estados para documentos
    const [documentos, setDocumentos] = useState([]);
    const [documentosLoading, setDocumentosLoading] = useState(false);
    const [mostrarFormDocumento, setMostrarFormDocumento] = useState(false);
    const [documentoFormData, setDocumentoFormData] = useState({ nombre: '', tipo: 'otro', descripcion: '' });
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [subiendoDocumento, setSubiendoDocumento] = useState(false);

    // Estados para paginación y acordeón
    const [paginaActual, setPaginaActual] = useState(1);
    const [consultaAbierta, setConsultaAbierta] = useState(null);
    const consultasPorPagina = 5;

    // Estado para modal de fallecimiento
    const [mostrarModalFallecimiento, setMostrarModalFallecimiento] = useState(false);
    const [motivoFallecimiento, setMotivoFallecimiento] = useState('');

    const isAdmin = user?.role === 'admin';
    const isDoctor = user?.role === 'doctor';
    const isClient = user?.role === 'client';
    const canAddInternado = isAdmin || isDoctor;
    const isRecepcion = user?.role === 'recepcion';
    const puedeGestionar = canAddInternado || isRecepcion;
    const puedeGestionarFallecido = isAdmin || isDoctor; // Solo admin y doctor pueden marcar fallecido

    // Función para cargar todos los datos
    const cargarTodosLosDatos = async () => {
        console.log('Cargando todos los datos para paciente:', id);
        setLoading(true);
        try {
            const pacienteRes = await getPacienteByIdRequest(id);
            setPaciente(pacienteRes.data);
            console.log('Paciente cargado:', pacienteRes.data.nombre);
            
            if (pacienteRes.data.ownerId) {
                setDueno(pacienteRes.data.ownerId);
                console.log('Dueño cargado');           
            }
            
            const internadosRes = await getInternadosByPacienteRequest(id);
            setInternados(internadosRes.data);
            console.log('Internados cargados:', internadosRes.data.length);
            
            await cargarHistorialCompleto();
            await cargarDocumentos();
        } catch (error) {
            console.error('Error cargando datos:', error);
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
            console.log('Cargando historial clínico para paciente:', id);
            const res = await getHistorialByPacienteRequest(id);
            console.log('Historial clínico cargado:', res.data);
            const historialOrdenado = (res.data.data || []).sort((a, b) => {
                const fechaA = a.citaId?.fecha || a.createdAt;
                const fechaB = b.citaId?.fecha || b.createdAt;
                return new Date(fechaA) - new Date(fechaB);
            });
            setHistorialCompleto(historialOrdenado);
            setPaginaActual(1);
            setConsultaAbierta(null);
        } catch (error) {
            console.error('Error cargando historial clínico:', error);
            if (error.response?.status !== 404) {
                manejarErrorResponse(error, setErrors, setSuccessMessage);
            }
            setHistorialCompleto([]);
        } finally {
            setHistorialLoading(false);
        }
    };

    // Función para cargar documentos
    const cargarDocumentos = async () => {
        if (!id) return;
        console.log('Cargando documentos para paciente:', id);
        setDocumentosLoading(true);
        try {
            const res = await getDocumentosByPacienteRequest(id);
            console.log('Documentos cargados:', res.data);
            setDocumentos(res.data.data || []);
        } catch (error) {
            console.error('Error cargando documentos:', error);
            setDocumentos([]);
        } finally {
            setDocumentosLoading(false);
        }
    };

    // Función para formatear fechas SIN desfase horario
    const formatearFechaLocal = (fecha) => {
        if (!fecha) return 'No especificada';
        
        if (typeof fecha === 'string' && fecha.includes('-')) {
            const [year, month, day] = fecha.split('-');
            return `${day}/${month}/${year}`;
        }
        
        try {
            const date = new Date(fecha);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${day}/${month}/${year}`;
        } catch {
            return 'No especificada';
        }
    };

    // Función para formatear fecha y hora SIN desfase horario
    const formatearFechaHora = (fechaISO) => {
        if (!fechaISO) return 'No especificada';
        
        if (typeof fechaISO === 'string' && fechaISO.includes('T')) {
            const [year, month, day] = fechaISO.split('T')[0].split('-');
            return `${day}/${month}/${year}`;
        }
        
        try {
            const date = new Date(fechaISO);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${day}/${month}/${year}`;
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
        if (!window.confirm(`¿Estas seguro de eliminar el internado del ${formatearFechaLocal(internadoFecha)}?`)) return;
        
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

    // ============================================
    // FUNCIONES PARA DOCUMENTOS CON GRIDFS
    // ============================================

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log('Archivo seleccionado:', file);
        if (file) {
            setArchivoSeleccionado(file);
            console.log('Nombre:', file.name);
            console.log('Tamaño:', file.size, 'bytes');
            console.log('Tipo:', file.type);
        }
    };

    const handleSubirDocumento = async (e) => {
        e.preventDefault();
        console.log('handleSubirDocumento ejecutado');
        console.log('documentoFormData:', documentoFormData);
        console.log('archivoSeleccionado:', archivoSeleccionado);
        
        if (!archivoSeleccionado) {
            console.log('No hay archivo seleccionado');
            toast.error('Por favor selecciona un archivo');
            return;
        }
        
        setSubiendoDocumento(true);
        try {
            const formData = new FormData();
            formData.append('archivo', archivoSeleccionado);
            formData.append('pacienteId', id);
            formData.append('nombre', documentoFormData.nombre || archivoSeleccionado.name);
            formData.append('tipo', documentoFormData.tipo || 'otro');
            formData.append('descripcion', documentoFormData.descripcion || '');
            
            console.log('Enviando formData a /api/documentos');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }
            
            const response = await uploadDocumentoRequest(formData);
            console.log('Documento subido exitosamente:', response.data);
            
            toast.success('Documento subido exitosamente');
            await cargarDocumentos();
            console.log('Documentos recargados');
            
            setMostrarFormDocumento(false);
            setDocumentoFormData({ nombre: '', tipo: 'otro', descripcion: '' });
            setArchivoSeleccionado(null);
        } catch (error) {
            console.error('Error subiendo documento:', error);
            console.error('Detalles del error:', error.response?.data);
            toast.error('Error al subir el documento: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubiendoDocumento(false);
        }
    };

    // Funcion para ver PDF con GridFS
    const handleVerPDF = async (doc) => {
        console.log('Abriendo PDF:', doc.nombre);
        try {
            const response = await verDocumentoRequest(doc._id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error al abrir PDF:', error);
            toast.error('Error al abrir el PDF');
        }
    };

    const handleDeleteDocumento = async (documentoId) => {
        console.log('Eliminando documento:', documentoId);
        if (!window.confirm('¿Estas seguro de eliminar este documento?')) return;
        try {
            await deleteDocumentoRequest(documentoId);
            await cargarDocumentos();
            toast.success('Documento eliminado');
            console.log('Documento eliminado');
        } catch (error) {
            console.error('Error al eliminar documento:', error);
            toast.error('Error al eliminar el documento');
        }
    };

    // ============================================
    // FUNCIONES PARA FALLECIDO
    // ============================================
    const handleMarcarFallecido = async () => {
        if (!motivoFallecimiento.trim()) {
            toast.error('Por favor ingresa el motivo del fallecimiento');
            return;
        }

        const confirmar = window.confirm(
            `🕊️ ¿Estás seguro de marcar a ${paciente.nombre} como fallecido?\n\n` +
            `Esta acción:\n` +
            `• No permitirá agendar nuevas citas\n` +
            `• No permitirá subir documentos\n` +
            `• No permitirá crear internados\n` +
            `• No permitirá agregar registros clínicos\n\n` +
            `Motivo: ${motivoFallecimiento}\n\n` +
            `¿Deseas continuar?`
        );
        
        if (!confirmar) return;
        
        try {
            await marcarFallecidoRequest(id, { motivoFallecimiento });
            toast.success(`Paciente ${paciente.nombre} marcado como fallecido`);
            setMostrarModalFallecimiento(false);
            setMotivoFallecimiento('');
            await cargarTodosLosDatos();
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
            toast.error('Error al marcar como fallecido');
        }
    };

    const handleReactivarPaciente = async () => {
        const confirmar = window.confirm(
            `🔄 ¿Estás seguro de REACTIVAR a ${paciente.nombre}?\n\n` +
            `Esta acción:\n` +
            `• Permitirá agendar nuevas citas\n` +
            `• Permitirá subir documentos\n` +
            `• Permitirá crear internados\n` +
            `• Permitirá agregar registros clínicos\n\n` +
            `¿Deseas continuar?`
        );
        
        if (!confirmar) return;
        
        try {
            await reactivarPacienteRequest(id);
            toast.success(`Paciente ${paciente.nombre} reactivado exitosamente`);
            await cargarTodosLosDatos();
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
            toast.error('Error al reactivar el paciente');
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

    // Calcular paginación
    const totalPaginas = Math.ceil(historialCompleto.length / consultasPorPagina);
    const inicio = (paginaActual - 1) * consultasPorPagina;
    const fin = inicio + consultasPorPagina;
    const consultasPagina = historialCompleto.slice(inicio, fin);

    const estaFallecido = paciente?.fallecido === true;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Botón de volver */}
            <button
                onClick={() => navigate('/pacientes')}
                className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver a Pacientes
            </button>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            )}

            {/* Paciente no encontrado */}
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

            {/* Contenido principal */}
            {!loading && paciente && (
                <>
                    {/* ========================================== */}
                    {/* SECCIÓN 1: DATOS DEL PACIENTE */}
                    {/* ========================================== */}
                    <div className="mb-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Informacion del Paciente</h2>
                            <div className="flex items-center gap-3">
                                {estaFallecido && (
                                    <span className="bg-gray-600 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                                        <span>🕊️</span> Fallecido
                                    </span>
                                )}
                                {puedeGestionarFallecido && (
                                    !estaFallecido ? (
                                        <button
                                            onClick={() => setMostrarModalFallecimiento(true)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <span>🕊️</span> Marcar Fallecido
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleReactivarPaciente}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <span>🔄</span> Reactivar Paciente
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <InfoCard
                            title={paciente.nombre}
                            data={[
                                { label: "Nombre", value: paciente.nombre },
                                { label: "Especie", value: paciente.especie },
                                { label: "Raza", value: paciente.raza || 'Sin especificar' },
                                { label: "Edad", value: paciente.edad ? `${paciente.edad} años` : 'No especificada' },
                                { label: "Sexo", value: paciente.sexo || 'No especificado' },
                                { label: "Color de pelaje", value: paciente.colorPelaje || 'No especificado' },
                                { label: "Peso", value: paciente.peso ? `${paciente.peso.valor} ${paciente.peso.unidad}` : 'No registrado' },
                                { label: "Temperatura", value: paciente.temperatura ? `${paciente.temperatura} °C` : 'No registrada' },
                                { label: "Antecedentes medicos", value: paciente.antecedentesMedicos || 'Sin antecedentes' },
                                { label: "Fecha de registro", value: formatearFechaLocal(paciente.fechaRegistro || paciente.createdAt) },
                                ...(estaFallecido ? [
                                    { label: "Fecha de fallecimiento", value: formatearFechaLocal(paciente.fechaFallecimiento) },
                                    { label: "Motivo de fallecimiento", value: paciente.motivoFallecimiento || 'No especificado' }
                                ] : [])
                            ]}
                        />
                    </div>

                    {/* ========================================== */}
                    {/* SECCIÓN 2: DATOS DEL DUEÑO */}
                    {/* ========================================== */}
                    {dueno && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Informacion del Dueño</h2>
                            <InfoCard
                                title={`${dueno.username} ${dueno.lastname}`}
                                data={[
                                    { label: "Nombre completo", value: `${dueno.username} ${dueno.lastname}` },
                                    { label: "Correo electronico", value: dueno.email },
                                    { label: "Telefono", value: dueno.phoneNumber },
                                    { label: "Cedula", value: dueno.cedula },
                                    { label: "Direccion", value: dueno.direccion },
                                ]}
                            />
                        </div>
                    )}
                    
                    {/* ========================================== */}
                    {/* SECCIÓN 3: HISTORIAL CLÍNICO */}
                    {/* ========================================== */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Historial Clinico</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Registro completo de todas las consultas medicas de {paciente.nombre}
                                </p>
                            </div>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {historialCompleto.length} consultas registradas
                            </span>
                        </div>

                        {historialLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : historialCompleto.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-gray-500 text-lg">No hay consultas registradas para esta mascota</p>
                                <p className="text-gray-400 text-sm mt-2">Las consultas se registran automaticamente al completar una cita</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {consultasPagina.map((registro, index) => {
                                        const globalIndex = inicio + index;
                                        const isOpen = consultaAbierta === globalIndex;
                                        const cita = registro.citaId || {};
                                        const fechaCita = cita.fecha || registro.createdAt;
                                        const citaId = cita._id || registro.citaId;
                                        
                                        return (
                                            <div key={registro._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                                <div 
                                                    className={`px-6 py-4 flex flex-wrap items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${
                                                        isOpen ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-100' : ''
                                                    }`}
                                                    onClick={() => setConsultaAbierta(isOpen ? null : globalIndex)}
                                                >
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="text-sm font-semibold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                                                            Consulta #{globalIndex + 1}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Fecha: {formatearFechaHora(fechaCita)}
                                                        </span>
                                                        {cita.horaInicio && (
                                                            <span className="text-sm text-gray-500">Hora: {cita.horaInicio}</span>
                                                        )}
                                                        <span className="text-sm text-gray-600 max-w-[200px] truncate">
                                                            {registro.motivoConsulta || 'Sin motivo'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {citaId && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/citas/${citaId}`);
                                                                }}
                                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                            >
                                                                Ver cita →
                                                            </button>
                                                        )}
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            cita.estado === 'completada' ? 'bg-green-100 text-green-700' :
                                                            cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-700' :
                                                            cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {cita.estado || 'Sin estado'}
                                                        </span>
                                                        <span className="text-gray-400 text-sm">
                                                            {isOpen ? '−' : '+'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isOpen && (
                                                    <div className="p-6 bg-white">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Motivo de la consulta</p>
                                                                <p className="text-gray-800 font-medium mt-1">{registro.motivoConsulta || 'No especificado'}</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sintomas reportados</p>
                                                                <p className="text-gray-800 font-medium mt-1">{registro.sintomas || 'No reportados'}</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Diagnostico</p>
                                                                <p className="text-gray-800 font-medium mt-1">{registro.diagnostico || 'No especificado'}</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tratamiento indicado</p>
                                                                <p className="text-gray-800 font-medium mt-1">{registro.tratamiento || 'No especificado'}</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Medicamentos recetados</p>
                                                                <p className="text-gray-800 font-medium mt-1">
                                                                    {registro.medicamentos && registro.medicamentos.length > 0 
                                                                        ? registro.medicamentos.map(m => `${m.nombre}${m.dosis ? ` (${m.dosis})` : ''}`).join(', ')
                                                                        : 'No especificados'}
                                                                </p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Examenes realizados</p>
                                                                <p className="text-gray-800 font-medium mt-1">
                                                                    {registro.examenes && registro.examenes.length > 0 
                                                                        ? registro.examenes.map(e => `${e.nombre}${e.resultado ? `: ${e.resultado}` : ''}`).join(', ')
                                                                        : 'No especificados'}
                                                                </p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Observaciones adicionales</p>
                                                                <p className="text-gray-800 font-medium mt-1">{registro.observaciones || 'No especificadas'}</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Proxima cita sugerida</p>
                                                                <p className="text-gray-800 font-medium mt-1">
                                                                    {registro.proximaCitaSugerida 
                                                                        ? formatearFechaHora(registro.proximaCitaSugerida)
                                                                        : 'No sugerida'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {totalPaginas > 1 && (
                                    <div className="flex justify-center items-center gap-3 mt-6">
                                        <button 
                                            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                            disabled={paginaActual === 1}
                                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            Pagina {paginaActual} de {totalPaginas}
                                        </span>
                                        <button 
                                            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                            disabled={paginaActual === totalPaginas}
                                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ========================================== */}
                    {/* SECCIÓN 4: DOCUMENTOS ADJUNTOS */}
                    {/* ========================================== */}
                    <div className="mb-10">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Documentos Adjuntos</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Resultados de laboratorio, radiografias, recetas y otros documentos
                                </p>
                            </div>
                            {puedeGestionar && !estaFallecido && (
                                <button
                                    onClick={() => {
                                        console.log('Abriendo formulario de subida de documentos');
                                        setMostrarFormDocumento(true);
                                    }}
                                    className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Subir Documento
                                </button>
                            )}
                        </div>

                        {/* Formulario de subida */}
                        {mostrarFormDocumento && !estaFallecido && (
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-700">Subir Documento</h2>
                                    <button
                                        onClick={() => {
                                            console.log('Cerrando formulario de subida');
                                            setMostrarFormDocumento(false);
                                            setDocumentoFormData({ nombre: '', tipo: 'otro', descripcion: '' });
                                            setArchivoSeleccionado(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
                                <form onSubmit={handleSubirDocumento} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del documento *
                                        </label>
                                        <input
                                            type="text"
                                            value={documentoFormData.nombre}
                                            onChange={(e) => {
                                                console.log('Nombre actualizado:', e.target.value);
                                                setDocumentoFormData({ ...documentoFormData, nombre: e.target.value });
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                            placeholder="Ej: Resultados de laboratorio"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo de documento
                                        </label>
                                        <select
                                            value={documentoFormData.tipo}
                                            onChange={(e) => {
                                                console.log('Tipo actualizado:', e.target.value);
                                                setDocumentoFormData({ ...documentoFormData, tipo: e.target.value });
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        >
                                            <option value="resultado_lab">Resultado de laboratorio</option>
                                            <option value="radiografia">Radiografia</option>
                                            <option value="receta">Receta medica</option>
                                            <option value="informe">Informe medico</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripcion (opcional)
                                        </label>
                                        <textarea
                                            value={documentoFormData.descripcion}
                                            onChange={(e) => {
                                                console.log('Descripcion actualizada:', e.target.value);
                                                setDocumentoFormData({ ...documentoFormData, descripcion: e.target.value });
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                            rows={2}
                                            placeholder="Breve descripcion del documento..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Archivo (PDF o imagen) *
                                        </label>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Formatos permitidos: PDF, JPG, PNG (max. 10MB)</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={subiendoDocumento}
                                        className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
                                    >
                                        {subiendoDocumento ? 'Subiendo...' : 'Subir Documento'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Lista de documentos */}
                        {documentosLoading ? (
                            <div className="flex justify-center items-center h-20">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                            </div>
                        ) : documentos.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-gray-500 text-lg">No hay documentos adjuntos</p>
                                <p className="text-gray-400 text-sm mt-2">Sube resultados, radiografias o recetas para este paciente</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {documentos.map((doc) => (
                                    <div key={doc._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">
                                                    {doc.tipo === 'resultado_lab' ? '' :
                                                     doc.tipo === 'radiografia' ? '' :
                                                     doc.tipo === 'receta' ? '' :
                                                     doc.tipo === 'informe' ? '' : ''}
                                                </span>
                                                <h4 className="font-medium text-gray-800 truncate">{doc.nombre}</h4>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                {doc.tipo && doc.tipo !== 'otro' ? 
                                                    doc.tipo.replace('_', ' ').toUpperCase() : 'Documento'}
                                            </p>
                                            {doc.descripcion && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{doc.descripcion}</p>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                Subido: {new Date(doc.createdAt).toLocaleDateString('es-CR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => handleVerPDF(doc)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                            >
                                                Ver PDF
                                            </button>
                                            {puedeGestionar && !estaFallecido && (
                                                <button
                                                    onClick={() => handleDeleteDocumento(doc._id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors ml-auto"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ========================================== */}
                    {/* SECCIÓN 5: HISTORIAL DE INTERNADOS */}
                    {/* ========================================== */}
                    <div>
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Historial de Internados</h2>
                            {puedeGestionar && !estaFallecido && (
                                <button
                                    onClick={() => setMostrarFormInternado(true)}
                                    className="bg-cyan-600 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-700 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Agregar Internado
                                </button>
                            )}
                        </div>

                        {/* Formulario de internado */}
                        {mostrarFormInternado && puedeGestionar && !estaFallecido && (
                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg md:text-xl font-semibold text-gray-700">Crear Nuevo Internado</h2>
                                    <button
                                        onClick={() => setMostrarFormInternado(false)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                    >
                                        ×
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

                        {/* Editar internado */}
                        {showEditInternadoForm && puedeGestionar && !estaFallecido && (
                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg md:text-xl font-semibold text-gray-700">Editar Internado</h2>
                                    <button
                                        onClick={handleCancelEditInternado}
                                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                    >
                                        ×
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

                        {/* Lista de internados */}
                        {internados.length === 0 ? (
                            <p className="text-gray-500">No hay internados registrados</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {internados.map((internado) => (
                                    <div key={internado._id} className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col min-h-[220px]">
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
                                                    <span className="text-gray-500">Via:</span>
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
                                        {puedeGestionar && !estaFallecido && (
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
                    {/* MODAL PARA MOTIVO DE FALLECIMIENTO */}
                    {/* ========================================== */}
                    {mostrarModalFallecimiento && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">🕊️ Marcar como Fallecido</h3>
                                    <button
                                        onClick={() => {
                                            setMostrarModalFallecimiento(false);
                                            setMotivoFallecimiento('');
                                        }}
                                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                <p className="text-gray-600 mb-4">
                                    Estás a punto de marcar a <strong>{paciente?.nombre}</strong> como fallecido.
                                    Esta acción no permitirá crear citas, documentos ni internados.
                                </p>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Motivo del fallecimiento *
                                    </label>
                                    <textarea
                                        value={motivoFallecimiento}
                                        onChange={(e) => setMotivoFallecimiento(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                                        rows={3}
                                        placeholder="Ej: Paro cardíaco, enfermedad crónica, accidente..."
                                        required
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Este motivo quedará registrado en el historial</p>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleMarcarFallecido}
                                        className="flex-1 bg-gray-600 text-white py-2.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        Confirmar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMostrarModalFallecimiento(false);
                                            setMotivoFallecimiento('');
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default PacienteDetallePage;