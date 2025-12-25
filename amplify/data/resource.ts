import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserApiKey: a
    .model({
      provider: a.string().required(), // anthropic, googleai, openai
      apiKey: a.string().required(), // encrypted API key
    })
    .authorization((allow) => [allow.owner()]),

  ApiSpec: a
    .model({
      name: a.string().required(), // API name
      fileName: a.string().required(), // Original file name
      content: a.string().required(), // Raw OpenAPI/Swagger content (JSON/YAML)
      format: a.string().required(), // 'json' | 'yaml'
      specVersion: a.string(), // OpenAPI version (3.0.0, 2.0, etc.)
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
