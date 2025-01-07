const {
  projectInstructions,
  clientInstructions,
  businessInstructions,
  ownerInstructions,
  teamInstructions,
  teamLeadInstructions
} = require ('./dataversePrompts')

function createProjectCompletionQuery (query ){
  const instructions = [
    `La consulta del usuario es la siguiente: ${query}`,
    ...projectInstructions,
    ...clientInstructions,
    ...businessInstructions,
    ...ownerInstructions,
    ...teamInstructions,
    ...teamLeadInstructions,
    `No te puedes inventar valores, solo agrega los valores si son especificados por la consulta`,
    `SOLO VAS A RESPONDER CON EL OBJETO JSON, no me digas nada mas alla del propio objeto y su contenido`,
  ]
  
  return  instructions.join(' ');
}

function handleProyectsfilter (query, dataverseURL){
  const projectFilters = queryFilterProject(query,'&')
  const clientFilters = queryFilterClient(query, ';')
  const businessFilter = queryFilterBusiness(query, ';')
  const projectOwnerFilter = queryFilterSystemUser(query, ';')
  const projectTeamFilter = queryFilterTeam(query, ';')
  const projectTeamLead = queryFilterTeamLead(query, ';')

  const baseUrl = dataverseURL + 'cr794_proyectos?$select=*&$expand='
  const clientQuery = "cr794_Cliente( $select=address1_postalcode,address1_composite,accountid,inteleq_intereses,int_licenciasactivas_date,int_proyectosactivos,new_cif,name,websiteurl,description" + clientFilters + "),"
  const businessQuery = "owningbusinessunit($select=address1_postalcode,emailaddress,address1_line1,address1_line2,websiteurl,address1_stateorprovince,address1_telephone1,address1_country,name" + businessFilter + "),"
  const owninguserQuery = "owninguser($select=fullname,systemuserid,title,internalemailaddress" + projectOwnerFilter + ")," 
  const cr794_EquipoQuery = "cr794_Equipo($select=name,teamid,description" + projectTeamFilter + "),"  
  const cr794_JefedeequipoQuery = "cr794_Jefedeequipo($select=fullname,systemuserid,title,internalemailaddress" + projectTeamLead +")"

  return baseUrl + clientQuery + businessQuery + owninguserQuery + cr794_EquipoQuery + cr794_JefedeequipoQuery + projectFilters
}


module.exports = {
  createProjectCompletionQuery,
  queryFilterBusiness,
  businessInstructions,
  handleProyectsfilter
};