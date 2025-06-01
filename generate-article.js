const { Ollama } = require('ollama');
const fs = require('fs');
const dayjs = require('dayjs');

const ollama = new Ollama({ model: 'mistral' });

async function generate() {
  const topics = JSON.parse(fs.readFileSync("./topics.json", "utf-8"));
  const used = fs.existsSync("./used.json")
    ? JSON.parse(fs.readFileSync("./used.json", "utf-8"))
    : [];

  const nextTopic = topics.find((t) => !used.includes(t));
  if (!nextTopic) return console.log("No more topics!");

  const prompt = `
Write a blog post in Markdown (1000–1200 words) for developers.
Topic: "${nextTopic}"
Include:
- Intro
- 4–5 subheadings
- Code samples (Angular)
- Conclusion with CTA
- YAML front matter (title, tags, description, cover_image)
`;

  const stream = await ollama.chat({ messages: [{ role: 'user', content: prompt }] });
  const result = stream.message.content;

  const filename = `./articles/${dayjs().format("YYYY-MM-DD")}-${nextTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
  fs.writeFileSync(filename, result);

  used.push(nextTopic);
  fs.writeFileSync("./used.json", JSON.stringify(used, null, 2));
}

generate();
