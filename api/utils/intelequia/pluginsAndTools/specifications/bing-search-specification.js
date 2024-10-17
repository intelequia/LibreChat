const bingSearchSpecification = {
  type: "function",
  function: {
    name: "bing-search",
    description: "Use the 'bing-search' tool to retrieve search results relevant to your input",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search word or phrase to Bing Sarch",
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

module.exports = bingSearchSpecification;