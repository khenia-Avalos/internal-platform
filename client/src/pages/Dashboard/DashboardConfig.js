import { ClientesPage } from "./ClientesPage";
import { DoctoresPage } from "./DoctoresPage";
import { CitasPage } from "./CitasPage";
import { PacientesPage } from "./PacientesPage";
import { PerfilPage } from "./PerfilPage";

// 1. Definimos los roles como constantes
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor', 
  CLIENTE: 'cliente'
};

// 2. Definimos los módulos para cada rol
export const dashboardModules = {
  [ROLES.ADMIN]: [
  {
    id: "clientes",
    name: "Clientes",
    component: ClientesPage,
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
  [ROLES.CLIENTE]: [
     {
    id: "citas",
    name: "Citas",
    component: CitasPage,
  },
 {
    id:"perfil",
    name:"Perfil",
    component:PerfilPage
  }
  
  ]
};