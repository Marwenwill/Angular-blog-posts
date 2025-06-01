const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const dayjs = require("dayjs");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
  - Meta: title, tags, description, cover_image in YAML front matter.
  `;

  const res = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const article = res.data.choices[0].message.content;

  const filename = `./articles/${dayjs().format("YYYY-MM-DD")}-${nextTopic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}.md`;

  fs.writeFileSync(filename, article);
  used.push(nextTopic);
  fs.writeFileSync("./used.json", JSON.stringify(used, null, 2));
}

generate();
