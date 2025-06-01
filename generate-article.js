const OpenAI = require("openai");
const fs = require("fs");
const dayjs = require("dayjs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generate() {
  const topics = JSON.parse(fs.readFileSync("./topics.json", "utf-8"));
  const used = fs.existsSync("./used.json")
    ? JSON.parse(fs.readFileSync("./used.json", "utf-8"))
    : [];

  const nextTopic = topics.find((t) => !used.includes(t));
  if (!nextTopic) return console.log("No more topics!");

  const prompt = `
  Write a blog post in Markdown (1000-1200 words) for Dev.to.
  Topic: "${nextTopic}"
  Include:
  - An intro
  - 4–5 section headers
  - Code snippets (Angular 17+)
  - A conclusion with a CTA
  - YAML front matter with: title, tags, description, cover_image.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const article = completion.choices[0].message.content;

  const filename = `./articles/${dayjs().format("YYYY-MM-DD")}-${nextTopic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}.md`;

  fs.writeFileSync(filename, article);
  used.push(nextTopic);
  fs.writeFileSync("./used.json", JSON.stringify(used, null, 2));
}

generate();
