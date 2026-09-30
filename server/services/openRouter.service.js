import { callAiProvider } from './aiProvider.service.js';

export const askAi = async (messages) => {
  return await callAiProvider(messages);
};