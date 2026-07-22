import { describe, expect, test } from "bun:test";
import MODELS_JSON from "@oh-my-pi/pi-catalog/models.json" with { type: "json" };
import { agnesModelManagerOptions } from "@oh-my-pi/pi-catalog/provider-models/openai-compat";
import type { FetchImpl, ModelSpec } from "@oh-my-pi/pi-catalog/types";

describe("Agnes provider discovery", () => {
	test("discovers Agnes models with tool support disabled", async () => {
		const calls: Array<{ url: string; authorization: string | null }> = [];
		const fetchMock: FetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
			const headers = new Headers(init?.headers);
			calls.push({
				url: String(input),
				authorization: headers.get("authorization"),
			});
			return new Response(
				JSON.stringify({
					data: [
						{
							id: "agnes-2.0-flash",
							object: "model",
							name: "Agnes 2.0 Flash",
							context_length: 128000,
							max_completion_tokens: 16384,
							input_modalities: ["text"],
							pricing: { prompt: "0", completion: "0", input_cache_read: "0" },
						},
						{
							id: "agnes-image-2.1-flash",
							object: "model",
							name: "Agnes Image 2.1 Flash",
							context_length: 32000,
							max_completion_tokens: 4096,
							input_modalities: ["text"],
							pricing: { prompt: "0", completion: "0", input_cache_read: "0" },
						},
					],
				}),
				{ status: 200, headers: { "content-type": "application/json" } },
			);
		};

		const options = agnesModelManagerOptions({ apiKey: "agnes-test-key", fetch: fetchMock });
		const models = await options.fetchDynamicModels?.();

		expect(calls).toEqual([
			{
				url: "https://apihub.agnes-ai.com/v1/models",
				authorization: "Bearer agnes-test-key",
			},
		]);

		const text = models?.find(model => model.id === "agnes-2.0-flash");
		expect(text).toBeDefined();
		expect(text).toMatchObject({
			provider: "agnes",
			api: "openai-completions",
			name: "Agnes 2.0 Flash",
			reasoning: true,
			input: ["text"],
			contextWindow: 128000,
			maxTokens: 16384,
			supportsTools: false,
		});

		const image = models?.find(model => model.id === "agnes-image-2.1-flash");
		expect(image).toBeDefined();
		expect(image).toMatchObject({
			provider: "agnes",
			api: "openai-completions",
			name: "Agnes Image 2.1 Flash",
			reasoning: false,
			input: ["text"],
			contextWindow: 32000,
			maxTokens: 4096,
			supportsTools: false,
		});
	});

	test("bundles Agnes models with tool support disabled", () => {
		const bundled =
			(MODELS_JSON as unknown as Record<string, Record<string, ModelSpec<"openai-completions">>>).agnes ?? {};
		expect(bundled["agnes-2.0-flash"]?.supportsTools).toBe(false);
		expect(bundled["agnes-image-2.1-flash"]?.supportsTools).toBe(false);
	});
});
