const projectInstructions = [
  `Si dentro de la consulta el usuario menciona el nombre o parte del nombre de un proyecto crearas una propiedad llamada 'cr794_name' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona estado de un proyecto crearas una propiedad llamada 'statuscode' y le asignaras el valor 0 si no esta empezada, 1 si esta en curso o activo y 2 si esta completado.`,
  `Si dentro de la consulta el usuario menciona progreso o avance de un proyecto crearas una propiedad llamada 'cr794_progreso' y el valor que asignaras sera un comparador de OData siguiendo el siguiente patron 'cr794_progreso [comparador] [valor]' en funcion de que comparacion quiera el usuario .`,
  `Si dentro de la consulta el usuario menciona el identificador o parte del identificador de un proyecto crearas una propiedad llamada 'cr794_proyectoid' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona horas estimadas de un proyecto crearas una propiedad llamada 'cr794_horasestimadas' y el valor que asignaras sera un comparador de OData siguiendo el siguiente patron 'cr794_horasestimadas [comparador] [valor]' en funcion de que comparacion quiera el usuario .`,
]

const clientInstructions = [
  `Si dentro de la consulta el usuario menciona el nombre o parte del nombre de un cliente crearas una propiedad llamada 'clientName' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona el identificador o parte del identificador de un cliente crearas una propiedad llamada 'clientId' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona la dirección de la empresa o parte de la direccion, crearas una propiedad llamada 'address' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona el código postal o parte de el, crearas una propiedad llamada 'postalCode' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona el CIF o parte de el, crearas una propiedad llamada 'cif' y le asignaras el valor.`,
];

const businessInstructions = [
  `Si dentro de la consulta el usuario menciona el nombre o parte del nombre de una unidad de negocio, crearas una propiedad llamada 'businessUnitName' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona el identificador o parte del identificador de una unidad de negocio, crearas una propiedad llamada 'businessUnitId' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona la dirección o parte de la direccion, crearas una propiedad llamada 'address' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona el código postal o parte de el, crearas una propiedad llamada 'postalCode' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona el estado o provincia, crearas una propiedad llamada 'stateOrProvince' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona la dirección de correo electrónico o parte del mismo, crearas una propiedad llamada 'email' y le asignaras el valor.`,
  `Si dentro de la consulta el usuario menciona el número de teléfono o parte de el, crearas una propiedad llamada 'telephone' y le asignaras el valor.`,
];

const ownerInstructions = [
  `Si dentro de la consulta el usuario menciona el nombre completo o parte del nombre del propietario del proyecto, crearás una propiedad llamada 'fullname' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona el cargo del propietario del proyecto, crearás una propiedad llamada 'title' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona el correo electrónico del propietario del proyecto o parte del correo, crearás una propiedad llamada 'email' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona el identificador o parte del identificador del propietario del proyecto, crearás una propiedad llamada 'systemuserid' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona la dirección del propietario del proyecto, crearás una propiedad llamada 'address' y le asignarás el valor correspondiente.`,
];

const teamInstructions = [
  `Si dentro de la consulta el usuario menciona el nombre del equipo del proyecto o parte de él, crearás una propiedad llamada 'teamName' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona el identificador del equipo del proyecto o parte del mismo, crearás una propiedad llamada 'teamid' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona la descripción del equipo del proyecto o parte de ella, crearás una propiedad llamada 'teamDescription' y le asignarás el valor.`,
];

const teamLeadInstructions = [
  `Si dentro de la consulta el usuario menciona el nombre completo o parte del nombre del jefe de equipo o team lead del proyecto, crearás una propiedad llamada 'teamLeadFullname' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona el cargo del jefe de equipo o team lead, crearás una propiedad llamada 'teamLeadTitle' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona el correo electrónico del jefe de equipo o team lead o parte del correo, crearás una propiedad llamada 'teamLeadEmail' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona el identificador o parte del identificador del jefe de equipo o team lead, crearás una propiedad llamada 'teamLeadSystemuserid' y le asignarás el valor.`,
  `Si dentro de la consulta el usuario menciona la dirección del jefe de equipo o team lead, crearás una propiedad llamada 'teamLeadAddress' y le asignarás el valor correspondiente.`,
];



module.exports = {
  projectInstructions,
  clientInstructions,
  businessInstructions,
  ownerInstructions,
  teamInstructions,
  teamLeadInstructions
};