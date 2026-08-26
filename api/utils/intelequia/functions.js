async function SaveFunctionsInCache(AssistantList) {
    const functions = global.myCache.get('functions');
    AssistantList.forEach((assistant) => {
        assistant.tools.forEach((tool) => {
            if (tool.function && IsToolAFunction(tool.function.name)) {
                functions.forEach((func) => {
                    if (func.name == tool.function.name) {
                        func.specifications = tool;
                    }
                });
            }
        });
    });
    global.myCache.set('functions', functions, process.env.FUNCTIONS_CACHE_TTL);
}

async function GetFunctionSpecification(toolName) {
    const functions = global.myCache.get('functions');
    const functionDefinition = functions.find((func) => func.name === toolName);
    return functionDefinition.specifications;
}

async function IsToolAFunction(toolName) {
    const functions = global.myCache.get('functions');
    return functions.some((func) => func.name === toolName);
}

module.exports = {
    IsToolAFunction,
    SaveFunctionsInCache,
    GetFunctionSpecification,
};
