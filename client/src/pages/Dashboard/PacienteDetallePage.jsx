import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/infoCard";
import { getClienteByIdRequest } from "/src/api/clientes";
import { getPacienteByOwnerRequest } from "/src/api/pacientes";
import { createPacienteRequest } from "/src/api/pacientes";


function PacienteDetallePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [paciente, setPaciente] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const clienteRes = await getClienteByIdRequest(id);
                setCliente(clienteRes.data);

                const mascotasRes = await getPacienteByOwnerRequest(id);
                setMascotas(mascotasRes.data);
            } catch (error) {
                manejarErrorResponse(error, setErrors, setSuccessMessage);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            cargarDatos();
        }
    }, [id]);

    const handleSubmitDueño = async (data) => {
        try {
            await createClienteRequest(data);
            setModalAbierto(false);
            const mascotasRes = await getClienteByIdRequest(id);
            setCliente(mascotasRes.data);
        } catch (error) {
            manejarErrorResponse(error, setErrors, setSuccessMessage);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/clientes')}
                className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver
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
                        title="Información del Paciente"
                        data={[
                            { label: "Nombre", value: mascota.nombre },
                            { label: "Especie", value: mascota.especie },
                            { label: "Raza", value: mascota.raza || 'Sin raza' },
                            { label: "Edad", value: mascota.edad ? `${mascota.edad} años` : 'No especificada' },
                            { label: "Sexo", value: mascota.sexo || 'No especificado' },
                            { label: "Antecedentes Médicos", value: mascota.antecedentesMedicos || 'No especificados' },
                            { label: "Color Pelaje", value: mascota.colorPelaje || 'No especificado' }

                        ]}
                    />

                    <div className="mt-4 mb-6">
                        <button
                            onClick={() => {
                                setErrors([]);
                                setModalAbierto(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            + Agregar Dueño
                        </button>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Dueño de {mascota.nombre}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cliente.map((cliente) => (
                            <InfoCard
                                key={cliente._id}
                                title={cliente.username}
                                data={[
                                    { label: "Nombre completo", value: `${cliente.username} ${cliente.lastname}` },
                                    { label: "Email", value: cliente.email },
                                    { label: "Teléfono", value: cliente.phoneNumber },
                                    { label: "Cédula", value: cliente.cedula },
                                    { label: "Dirección", value: cliente.direccion },
                                ]}
                            />
                        ))}
                    </div>
                </>
            )}

            <Modal
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                title="Agregar Nueva Mascota"
            >
                <DynamicForm
                    {...createConfig.registerCliente}
                    layout="grid"
                    defaultValues={{ ownerId: id }}
                    customProps={{ ownerOptions: [{ value: id, label: cliente?.username }] }}
                    onSubmit={handleSubmitMascota}
                    errors={errors}
                    successMessage={successMessage}
                />
            </Modal>
        </div>
    );
}

export default ClienteDetallePage;