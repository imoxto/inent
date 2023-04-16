import axios from "axios";
import { env } from "~/env.mjs";

export type CGPTApiData = {
  id: string;
  object: "chat.completion";
  created: Date;
  model: "gpt-3.5-turbo-0301";
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: {
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "stop";
    index: number;
  }[];
};

export type CGPTApiRequestConfig = {
  temperature: number;
  top_p: number;
  n: number;
  stream: boolean;
  presence_penalty: number;
  frequency_penalty: number;
  max_tokens?: number;
};

const defaultCGPTApiRequestConfig: CGPTApiRequestConfig = {
  temperature: 0,
  top_p: 1.0,
  n: 1,
  stream: false,
  presence_penalty: 0,
  frequency_penalty: 0,
  max_tokens: 1000,
};

export async function cgptRequest(
  content: string,
  cgptConfig: CGPTApiRequestConfig = defaultCGPTApiRequestConfig
) {
  const messages = [
    {
      role: "user",
      content,
    },
  ];
  const cgptReply = await axios.post<CGPTApiData>(
    `https://api.openai.com/v1/chat/completions`,
    {
      model: "gpt-3.5-turbo",
      messages,
      ...cgptConfig,
    },
    {
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  // TODO: trackTokensUsed(cgptReply.data.usage.total_tokens)
  return cgptReply;
}
