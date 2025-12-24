import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserApiKey: a
    .model({
      provider: a.string().required(), // anthropic, googleai, openai
      apiKey: a.string().required(), // encrypted API key
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
