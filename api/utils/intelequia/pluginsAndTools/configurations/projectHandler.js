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


function queryFilterTeamLead(filterQuery, appender){

  let filter = []

  if(filterQuery.teamLeadFullname)
    filter.push("contains(fullname, '" + filterQuery.teamLeadFullname + "')")

  if(filterQuery.teamLeadTitle)
    filter.push("contains(title, '" + filterQuery.teamLeadTitle + "')")

  if(filterQuery.businessUnitId)
    filter.push("contains(businessunitid, '" + filterQuery.businessUnitId + "')")

  if(filterQuery.teamLeadEmail)
    filter.push("contains(internalemailaddress, '" + filterQuery.teamLeadEmail + "')")

  if(filterQuery.teamLeadSystemuserid)
    filter.push("contains(systemuserid, '" + filterQuery.teamLeadSystemuserid + "')")
  
  return filter.length > 0 ? appender + '$filter=' + filter.join(' and ') : '';
}

function queryFilterTeam(filterQuery, appender){

  let filter = []

  if(filterQuery.teamName)
    filter.push("contains(name, '" + filterQuery.teamName + "')")

  if(filterQuery.teamid)
    filter.push("contains(teamid, '" + filterQuery.teamid + "')")

  if(filterQuery.teamDescription)
    filter.push("contains(description, '" + filterQuery.teamDescription + "')")

  return filter.length > 0 ? appender + '$filter=' + filter.join(' and ') : '';
}

function queryFilterSystemUser(filterQuery, appender){

  let filter = []

  if(filterQuery.fullname)
    filter.push("contains(fullname, '" + filterQuery.fullname + "')")

  if(filterQuery.title)
    filter.push("contains(title, '" + filterQuery.title + "')")

  if(filterQuery.businessUnitId)
    filter.push("contains(businessunitid, '" + filterQuery.businessUnitId + "')")

  if(filterQuery.email)
    filter.push("contains(internalemailaddress, '" + filterQuery.email + "')")

  if(filterQuery.systemuserid)
    filter.push("contains(systemuserid, '" + filterQuery.systemuserid + "')")
  
  return filter.length > 0 ? appender + '$filter=' + filter.join(' and ') : '';
}

function queryFilterBusiness(filterQuery, appender){
  let filter = []

  if(filterQuery.businessUnitName)
    filter.push("contains(name, '" + filterQuery.businessUnitName + "')")

  if(filterQuery.businessUnitId)
    filter.push("contains(businessunitid, '" + filterQuery.businessUnitId + "')")

  if(filterQuery.address)
    filter.push("(contains(address1_line1, '" + filterQuery.address + "') or (contains(address1_line2, '" + filterQuery.address + "'))")

  if(filterQuery.postalCode)
    filter.push("contains(address1_postalcode, '" + filterQuery.postalCode + "')")

  if(filterQuery.stateOrProvince)
    filter.push("contains(address1_country, '" + filterQuery.stateOrProvince + "')")

  if(filterQuery.email)
    filter.push("contains(emailaddress, '" + filterQuery.email + "')")

  if(filterQuery.telephone)
    filter.push("contains(address1_telephone1, '" + filterQuery.telephone + "')")

  return filter.length > 0 ? appender + '$filter=' + filter.join(' and ') : '';
}

function  queryFilterClient (filterQuery, appender){
  let filter = []

  if(filterQuery.clientName)
    filter.push("contains(name, '" + filterQuery.clientName + "')")

  if(filterQuery.accountid)
    filter.push("contains(accountid, '" + filterQuery.clientId + "')")

  if(filterQuery.address)
    filter.push("(contains(address1_line1, '" + filterQuery.address + "') or (contains(address1_line2, '" + filterQuery.address + "'))")

  if(filterQuery.postalCode)
    filter.push("contains(address1_postalcode, '" + filterQuery.postalCode + "')")

  if(filterQuery.cif)
    filter.push("contains(new_cif, '" + filterQuery.cif + "')")

  return filter.length > 0 ? appender +'$filter=' + filter.join(' and ') : '';
}

function queryFilterProject (filterQuery, appender){
  let filter = []

  if(filterQuery.cr794_name)
    filter.push("contains(cr794_name, '" + filterQuery.cr794_name + "')")

  if(filterQuery.statuscode)
    filter.push("statuscode eq " + filterQuery.statuscode)

  if(filterQuery.cr794_progreso)
    filter.push(filterQuery.cr794_progreso)

  if(filterQuery.cr794_proyectoid)
    filter.push("contains(cr794_proyectoid, '" + filterQuery.cr794_proyectoid + "')")

  if(filterQuery.cr794_horasestimadas)
    filter.push(filterQuery.cr794_horasestimadas)

  return filter.length > 0 ? appender + '$filter=' + filter.join(' and ') : '';
}

module.exports = {
  createProjectCompletionQuery,
  queryFilterBusiness,
  businessInstructions,
  handleProyectsfilter
};