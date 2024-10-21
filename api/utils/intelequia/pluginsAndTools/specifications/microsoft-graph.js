const microsoftGraphSpecification = {
  type: "function",
  function: {
    name: "microsoft-graph",
    description: "Tool Created to make Microsoft Graph Requests",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "User Query to graph",
        },
      },
      required: [
        "query",
      ],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
  },
}

module.exports = microsoftGraphSpecification;