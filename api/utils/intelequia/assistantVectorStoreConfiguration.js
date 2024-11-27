
const handleKnowledge = async ({ fileId, assistantId }, openai) =>{

  const assistant = await openai.beta.assistants.retrieve(assistantId);

  if(assistant.tool_resources){
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
}

module.exports = {
  handleKnowledge
};