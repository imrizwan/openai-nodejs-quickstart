import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [questionInput, setQuestion] = useState("");
  const [result, setResult] = useState();
  const [tryLeft, setTryLeft] = useState();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: questionInput }),
    });
    const data = await response.json();
    setResult(data.result);
    setTryLeft(data.tryLeft);
    setLoading(false);
    setQuestion("");
  }

  return (
    <div>
      <Head>
        <title>OpenAI - Generate an text</title>
        <link rel="icon" href="/question.png" />
      </Head>

      <main className={styles.main}>
        <img src="/question.png" className={styles.icon} />
        <h3>You can ask me anything</h3>
        <form onSubmit={onSubmit}>
          <textarea
            style={{
              marginBottom: 40,
              borderRadius: 10,
              padding: 10
            }}
            type="text"
            name="question"
            required
            placeholder="Enter a question"
            value={questionInput}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <input disabled = {loading} type="submit" value={loading ? "Fetching Result..." : "Generate answer"} />
        </form>
        <div style={{ marginTop: 40 }}>{tryLeft}</div>
        <div className={styles.result} style={{ textAlign: "justify", padding: 16 }}>{result}</div>
      </main>
    </div>
  );
}
