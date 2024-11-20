const sharepointSpecification = {
  type: "function",
  function: {
    name: "sharepoint",
    description: "Tool Created to make Microsoft Graph Requests focus on sharepoint",
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

module.exports = sharepointSpecification;