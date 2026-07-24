const resp = await fetch('https://api.llmgateway.io/v1/models');
const data = await resp.json();
const models = data.data || [];
const imageModels = models.filter(m => /seedream|cogview|image|glm-image|qwen-image|dall|flux|imagen/i.test(m.id));
for (const m of imageModels.slice(0, 8)) {
  console.log(JSON.stringify({
    id: m.id,
    architecture: m.architecture,
    providers: m.providers?.map(p => ({ id: p.id, tools: p.tools })),
    object: m.object,
    owned_by: m.owned_by,
  }, null, 2));
}
console.log(`\nTotal image-like models: ${imageModels.length}`);
// Also check a known chat model for comparison
const gpt4o = models.find(m => m.id === 'gpt-4o');
if (gpt4o) {
  console.log('\n--- gpt-4o for comparison ---');
  console.log(JSON.stringify({ id: gpt4o.id, architecture: gpt4o.architecture, providers: gpt4o.providers?.map(p => ({ id: p.id, tools: p.tools })) }, null, 2));
}
