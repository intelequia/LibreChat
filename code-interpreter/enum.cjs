'use strict';

/**
 * Enum representing the various event types emitted during the execution of runnables.
 * These events provide real-time information about the progress and state of different components.
 *
 * @enum {string}
 */
exports.GraphEvents = void 0;
(function (GraphEvents) {
    /* Custom Events */
    /** [Custom] Delta event for run steps (message creation and tool calls) */
    GraphEvents["ON_RUN_STEP"] = "on_run_step";
    /** [Custom] Delta event for run steps (tool calls) */
    GraphEvents["ON_RUN_STEP_DELTA"] = "on_run_step_delta";
    /** [Custom] Completed event for run steps (tool calls) */
    GraphEvents["ON_RUN_STEP_COMPLETED"] = "on_run_step_completed";
    /** [Custom] Delta events for messages */
    GraphEvents["ON_MESSAGE_DELTA"] = "on_message_delta";
    /** [Custom] Reasoning Delta events for messages */
    GraphEvents["ON_REASONING_DELTA"] = "on_reasoning_delta";
    /* Official Events */
    /** Custom event, emitted by system */
    GraphEvents["ON_CUSTOM_EVENT"] = "on_custom_event";
    /** Emitted when a chat model starts processing. */
    GraphEvents["CHAT_MODEL_START"] = "on_chat_model_start";
    /** Emitted when a chat model streams a chunk of its response. */
    GraphEvents["CHAT_MODEL_STREAM"] = "on_chat_model_stream";
    /** Emitted when a chat model completes its processing. */
    GraphEvents["CHAT_MODEL_END"] = "on_chat_model_end";
    /** Emitted when a language model starts processing. */
    GraphEvents["LLM_START"] = "on_llm_start";
    /** Emitted when a language model streams a chunk of its response. */
    GraphEvents["LLM_STREAM"] = "on_llm_stream";
    /** Emitted when a language model completes its processing. */
    GraphEvents["LLM_END"] = "on_llm_end";
    /** Emitted when a chain starts processing. */
    GraphEvents["CHAIN_START"] = "on_chain_start";
    /** Emitted when a chain streams a chunk of its output. */
    GraphEvents["CHAIN_STREAM"] = "on_chain_stream";
    /** Emitted when a chain completes its processing. */
    GraphEvents["CHAIN_END"] = "on_chain_end";
    /** Emitted when a tool starts its operation. */
    GraphEvents["TOOL_START"] = "on_tool_start";
    /** Emitted when a tool completes its operation. */
    GraphEvents["TOOL_END"] = "on_tool_end";
    /** Emitted when a retriever starts its operation. */
    GraphEvents["RETRIEVER_START"] = "on_retriever_start";
    /** Emitted when a retriever completes its operation. */
    GraphEvents["RETRIEVER_END"] = "on_retriever_end";
    /** Emitted when a prompt starts processing. */
    GraphEvents["PROMPT_START"] = "on_prompt_start";
    /** Emitted when a prompt completes its processing. */
    GraphEvents["PROMPT_END"] = "on_prompt_end";
})(exports.GraphEvents || (exports.GraphEvents = {}));
exports.Providers = void 0;
(function (Providers) {
    Providers["OPENAI"] = "openAI";
    Providers["BEDROCK_LEGACY"] = "bedrock_legacy";
    Providers["VERTEXAI"] = "vertexai";
    Providers["BEDROCK"] = "bedrock";
    Providers["ANTHROPIC"] = "anthropic";
    Providers["MISTRALAI"] = "mistralai";
    Providers["OLLAMA"] = "ollama";
    Providers["GOOGLE"] = "google";
    Providers["AZURE"] = "azureOpenAI";
})(exports.Providers || (exports.Providers = {}));
exports.GraphNodeKeys = void 0;
(function (GraphNodeKeys) {
    GraphNodeKeys["TOOLS"] = "tools";
    GraphNodeKeys["AGENT"] = "agent";
    GraphNodeKeys["PRE_TOOLS"] = "pre_tools";
    GraphNodeKeys["POST_TOOLS"] = "post_tools";
})(exports.GraphNodeKeys || (exports.GraphNodeKeys = {}));
exports.GraphNodeActions = void 0;
(function (GraphNodeActions) {
    GraphNodeActions["TOOL_NODE"] = "tool_node";
    GraphNodeActions["CALL_MODEL"] = "call_model";
    GraphNodeActions["ROUTE_MESSAGE"] = "route_message";
})(exports.GraphNodeActions || (exports.GraphNodeActions = {}));
exports.CommonEvents = void 0;
(function (CommonEvents) {
    CommonEvents["LANGGRAPH"] = "LangGraph";
})(exports.CommonEvents || (exports.CommonEvents = {}));
exports.StepTypes = void 0;
(function (StepTypes) {
    StepTypes["TOOL_CALLS"] = "tool_calls";
    StepTypes["MESSAGE_CREATION"] = "message_creation";
})(exports.StepTypes || (exports.StepTypes = {}));
exports.ContentTypes = void 0;
(function (ContentTypes) {
    ContentTypes["TEXT"] = "text";
    ContentTypes["THINK"] = "think";
    ContentTypes["TOOL_CALL"] = "tool_call";
    ContentTypes["IMAGE_FILE"] = "image_file";
    ContentTypes["IMAGE_URL"] = "image_url";
    ContentTypes["ERROR"] = "error";
})(exports.ContentTypes || (exports.ContentTypes = {}));
exports.ToolCallTypes = void 0;
(function (ToolCallTypes) {
    ToolCallTypes["FUNCTION"] = "function";
    ToolCallTypes["RETRIEVAL"] = "retrieval";
    ToolCallTypes["FILE_SEARCH"] = "file_search";
    ToolCallTypes["CODE_INTERPRETER"] = "code_interpreter";
    /* Agents Tool Call */
    ToolCallTypes["TOOL_CALL"] = "tool_call";
})(exports.ToolCallTypes || (exports.ToolCallTypes = {}));
exports.Callback = void 0;
(function (Callback) {
    Callback["TOOL_ERROR"] = "handleToolError";
    Callback["TOOL_START"] = "handleToolStart";
    Callback["TOOL_END"] = "handleToolEnd";
    /*
    LLM_START = 'handleLLMStart',
    LLM_NEW_TOKEN = 'handleLLMNewToken',
    LLM_ERROR = 'handleLLMError',
    LLM_END = 'handleLLMEnd',
    CHAT_MODEL_START = 'handleChatModelStart',
    CHAIN_START = 'handleChainStart',
    CHAIN_ERROR = 'handleChainError',
    CHAIN_END = 'handleChainEnd',
    TEXT = 'handleText',
    AGENT_ACTION = 'handleAgentAction',
    AGENT_END = 'handleAgentEnd',
    RETRIEVER_START = 'handleRetrieverStart',
    RETRIEVER_END = 'handleRetrieverEnd',
    RETRIEVER_ERROR = 'handleRetrieverError',
    CUSTOM_EVENT = 'handleCustomEvent'
    */
})(exports.Callback || (exports.Callback = {}));
exports.Constants = void 0;
// INTELEQUIA: ENDPOINT TO CODE_INTERPRETER API URL
(function (Constants) {
    Constants["OFFICIAL_CODE_BASEURL"] = "http://localhost:2222/run";
    Constants["EXECUTE_CODE"] = "execute_code";
    Constants["CONTENT_AND_ARTIFACT"] = "content_and_artifact";
})(exports.Constants || (exports.Constants = {}));
exports.EnvVar = void 0;
(function (EnvVar) {
    EnvVar["CODE_API_KEY"] = "LIBRECHAT_CODE_API_KEY";
    EnvVar["CODE_BASEURL"] = "LIBRECHAT_CODE_BASEURL";
})(exports.EnvVar || (exports.EnvVar = {}));
//# sourceMappingURL=enum.cjs.map
