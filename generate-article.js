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
  if (!nextTopic) return console.log("✅ Tous les sujets ont été utilisés.");

  const prompt = `
Write a technical blog post in Markdown (approx. 1000–1200 words) for Dev.to.
Topic: "${nextTopic}"
Include:
- A catchy intro
- 4–5 technical sections
- Angular 17+ code samples
- YAML front matter with title, tags, description, and cover_image
- A clear conclusion with a call to action
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const article = completion.choices[0].message.content;
    const filename = `./articles/${dayjs().format("YYYY-MM-DD")}-${nextTopic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.md`;

    fs.writeFileSync(filename, article);
    used.push(nextTopic);
    fs.writeFileSync("./used.json", JSON.stringify(used, null, 2));

    console.log("✅ Article généré :", filename);
  } catch (err) {
    console.error("❌ Erreur OpenAI :", err.message);
  }
}

generate();
