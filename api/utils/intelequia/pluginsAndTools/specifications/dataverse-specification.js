const dataverseSpecification = {
  type: "function",
  function: {
    name: "dataverse",
    description: "Tool Created to make Dataverse Requests",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "User Query to dataverse",
        }
      },
      required: [
        "query",
      ],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
  },
}

module.exports = dataverseSpecification;