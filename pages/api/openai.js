import { Configuration, OpenAIApi } from "openai";
import publicIp from 'public-ip';
import { connectToDatabase } from '../../lib/mongo'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (req.method === "POST") {
    try {
      let { db } = await connectToDatabase();
      let collection = db.collection('ips')
      // const IPSchema = new mongoose.Schema({ ip: { type: String, required: true }, count: { type: Number, required: true, default: 0 } });

      // const IP = mongoose.models.IP || mongoose.model('IP', IPSchema)

      let ip = await publicIp.v4();
      ip = ip.split(".").join("");
      let rec = await collection.findOne({ ip });
      let count = rec?.count ?? 0
      let TOTALTRIES = Number(process.env.TOTALTRIES);
      if (req.body?.question === process.env.MAGICALWORDS) {
        await collection.deleteOne({ ip });
        return res.status(200).json({ result: "Margical Words Worked!" })
      }
      if (count === TOTALTRIES) {
        return res.status(200).json({ result: "Sorry! You're Blocked" })
      } else if ((count === 0 || count < 0) && !rec) {
        rec = collection.insertOne({ ip, count: 0 });
      } else {
        rec = await collection.findOneAndUpdate({ ip }, { $set: { count: count + 1 } });
        count = count + 1
      }

      const completion = await openai.createCompletion("text-ada-001", {
        prompt: generatePrompt(req.body.question),
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      res.status(200).json({
        result: completion.data.choices[0].text,
        tryLeft: `${TOTALTRIES - count} call(s) remaining`
      });
    } catch (e) {
      console.log(e)
      res.status(500).json({
        result: `Something went wrong, ${e?.message}.`
      });
    }
  } else {
    return res.status(500).json({
      result: `Fuck You Hacker`
    });
  }
}

function generatePrompt(question) {
  return question;
}
