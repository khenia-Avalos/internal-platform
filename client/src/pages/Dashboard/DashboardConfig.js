import ClientesPage from "../Dashboard/ClientesPage";

import DoctoresPage from "../Dashboard/DoctoresPage"; 
import CitasPage from "../Dashboard/CitasPage";      
import PacientesPage from "../Dashboard/PacientesPage";
import PerfilPage from "../Dashboard/PerfilPage";   
import ClientesTemporalesPage from "../Dashboard/ClientesTempralesPage"; 
// 1. Definimos los roles como constantes
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor', 
  CLIENTE: 'client'
};

// 2. Definimos los módulos para cada rol
export const dashboardModules = {
  [ROLES.ADMIN]: [
  {
    id: "clientes",
    name: "Clientes",
    component: ClientesPage,
  },{
    id: "clientes Temporales",
    name: "Clientes Temporales",
    component: ClientesTemporalesPage,
  },{
    id: "doctores",
    name: "Doctores",
    component: DoctoresPage,

  },
  {
    id: "citas",
    name: "Citas",
    component: CitasPage,
  },
  {
    id: "pacientes",
    name: "Pacientes",
    component: PacientesPage,
  },{
    id:"perfil",
    name:"Perfil",
    component:PerfilPage
  }
  ],
  [ROLES.DOCTOR]: [
     {
    id: "citas",
    name: " Mis Citas",
    component: CitasPage,
  },
  {
    id: "pacientes",
    name: "Pacientes",
    component: PacientesPage,
  },{
    id:"perfil",
    name:"Perfil",
    component:PerfilPage
  },  {
    id: "doctores",  
    name: "Mi Información",
    component: DoctoresPage,
  }

  ],
  [ROLES.CLIENTE]: [
     {
    id: "citas",
    name: " Mis Citas",
    component: CitasPage,
  },
 {
    id:"perfil",
    name:"Perfil",
    component:PerfilPage
  }, {
    id: "pacientes",
    name: "Mis Mascotas",
    component: PacientesPage,
  },
  
  ]
};