
const handleKnowledge = async ({ fileId, assistantId }, openai) =>{

  const isAgentClient = openai.constructor.name == 'AIProjectsClient'

  const assistant = isAgentClient ?
    await openai.agents.getAgent(assistantId) :
    await openai.beta.assistants.retrieve(assistantId);

  if( !isAgentClient && assistant.tool_resources ){
    if(assistant.tool_resources.file_search?.vector_store_ids?.length > 0){
      const vectorStoreId = assistant.tool_resources.file_search.vector_store_ids[0]
      await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStoreId,{file_ids: [fileId]})
    }
    else{
      const vectorStore = await openai.beta.vectorStores.create({
        name: assistant.name.replace(/ /g, "_") + "_vs"
      });
      await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStore.id,{file_ids: [fileId]})

      const isFileSearchEnabled = assistant.tools.some(tool => tool.type === "file_search")
      if(!isFileSearchEnabled){
        assistant.tools.push({"type":"file_search"})
      }
      if ( !assistant.tool_resources.file_search ) 
        assistant.tool_resources.file_search = {vector_store_ids:[vectorStore.id]}
      
      else
        assistant.tool_resources.file_search.vector_store_ids.push(vectorStore.id)
      
      await openai.beta.assistants.update(assistantId,{
        tools: assistant.tools,  
        tool_resources : assistant.tool_resources
      })
    }
  }
  if(isAgentClient && assistant.toolResources){
    const vectorStoreFileOptions = {
      fileId: fileId
    }

    if(assistant.toolResources.fileSearch.vectorStoreIds.length > 0){
      const vectorStoreId = assistant.toolResources.fileSearch.vectorStoreIds[0]
      const poller =  openai.agents.createVectorStoreFileAndPoll(vectorStoreId,vectorStoreFileOptions)
      await poller.pollUntilDone();

    }
    else {
      const vectorStore =  await openai.agents.createVectorStore ({
        name: assistant.name.replace(/ /g, "_") + "_vs"
      });
      const poller = await openai.agents.createVectorStoreFileAndPoll(vectorStore.id,vectorStoreFileOptions)
      await poller.pollUntilDone();

      const isFileSearchEnabled = assistant.tools.some(tool => tool.type === "file_search")
      if(!isFileSearchEnabled){
        assistant.tools.push({"type":"file_search"})
      }
      if ( !assistant.toolResources.fileSearch ) 
        assistant.toolResources.fileSearch = {vector_store_ids:[vectorStore.id]}
      
      else
        assistant.toolResources.fileSearch.vectorStoreIds.push(vectorStore.id)

      await openai.agents.updateAgent(assistantId,{
        tools: assistant.tools,  
        toolResources : assistant.toolResources
      });
    }
  }
}

module.exports = {
  handleKnowledge
};