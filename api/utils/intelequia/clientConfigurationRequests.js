async function parseModels (models){
  const {azureAssistants, azureOpenAI} = models
  const assistantModelIndex = azureOpenAI.indexOf(azureAssistants[0])
  const [model] = azureOpenAI.splice(assistantModelIndex,1)
  azureOpenAI.unshift(model)
  models.azureOpenAI = azureOpenAI;
  return models
}

module.exports = {
  parseModels
};