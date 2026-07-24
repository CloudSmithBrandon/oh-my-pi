import { createApiKeyLogin } from "./api-key-login";
import type { OAuthLoginCallbacks } from "./oauth/types";
import type { ProviderDefinition } from "./types";

const AUTH_URL = "https://devpass.llmgateway.io";
const DEFAULT_API_BASE_URL = "https://api.llmgateway.io/v1";
const VALIDATION_MODEL = "gpt-4o-mini";

/**
 * Login to LLM Gateway.
 *
 * Opens browser to DevPass dashboard, prompts user to paste their API key.
 * Returns the API key directly (not OAuthCredentials - this isn't OAuth).
 */
export const loginLLMGateway = createApiKeyLogin({
	providerLabel: "LLM Gateway",
	authUrl: AUTH_URL,
	instructions: "Copy your DevPass API key from llmgateway.io",
	promptMessage: "Paste your LLM Gateway API key",
	placeholder: "llmgtwy_...",
	validation: {
		kind: "chat-completions",
		provider: "LLM Gateway",
		baseUrl: () => Bun.env.LLM_GATEWAY_BASE_URL ?? DEFAULT_API_BASE_URL,
		model: VALIDATION_MODEL,
	},
});

export const llmGatewayProvider = {
	id: "llmgateway",
	name: "LLM Gateway",
	login: (cb: OAuthLoginCallbacks) => loginLLMGateway(cb),
} as const satisfies ProviderDefinition;
