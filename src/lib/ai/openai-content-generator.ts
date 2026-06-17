import { parseAiContentFields, type AiContentFields } from "@/lib/ai-content";

export type RaceContentGenerationContext = {
  seriesCode: string;
  seriesName: string;
  raceName: string;
  country: string | null;
  location: string | null;
  venueName: string | null;
  startDate: string;
  endDate: string;
  sessions: Array<{
    name: string;
    startTimeUtc: string;
    isMustWatch: boolean;
  }>;
};

type FetchImplementation = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summaryThreeLines",
    "keyDriversOrTeams",
    "raceVariables",
    "beginnerRules",
    "mustWatchReason",
    "notificationText",
    "seoTitle",
    "seoDescription",
  ],
  properties: {
    summaryThreeLines: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string", maxLength: 160 },
    },
    keyDriversOrTeams: { type: ["string", "null"], maxLength: 300 },
    raceVariables: {
      type: "array",
      maxItems: 5,
      items: { type: "string", maxLength: 120 },
    },
    beginnerRules: { type: ["string", "null"], maxLength: 800 },
    mustWatchReason: { type: ["string", "null"], maxLength: 500 },
    notificationText: { type: ["string", "null"], maxLength: 120 },
    seoTitle: { type: ["string", "null"], maxLength: 70 },
    seoDescription: { type: ["string", "null"], maxLength: 160 },
  },
} as const;

function readOutputText(value: unknown): string {
  if (typeof value !== "object" || value === null) {
    throw new Error("OpenAI response is invalid");
  }
  if (
    "choices" in value &&
    Array.isArray(value.choices) &&
    value.choices.length > 0
  ) {
    const choice = value.choices[0];
    if (
      typeof choice === "object" &&
      choice !== null &&
      "message" in choice &&
      typeof choice.message === "object" &&
      choice.message !== null &&
      "content" in choice.message &&
      typeof choice.message.content === "string"
    ) {
      return choice.message.content;
    }
  }
  throw new Error("OpenAI response is missing structured output");
}

export class OpenAiContentGenerator {
  readonly model = "gpt-4o-mini";

  constructor(
    private readonly apiKey: string,
    private readonly fetchImplementation: FetchImplementation = fetch,
  ) {}

  async generate(context: RaceContentGenerationContext): Promise<AiContentFields> {
    const response = await this.fetchImplementation("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "너는 한국어 모터스포츠 입문자용 에디터다. 출력 JSON의 모든 자연어 문장은 반드시 한국어로 작성하고, 대회명 같은 고유명사만 원문을 유지한다. 입력 JSON에 명시된 저장 사실만 사용한다. 입력에 없는 노면, 코스 특성, 날씨, 경기 형식, 역사, 참가자, 결과를 추측하거나 일반 상식으로 보충하지 않는다. 근거가 없는 필드는 null 또는 빈 배열로 반환한다. summaryThreeLines는 확인 가능한 시리즈, 대회명, 날짜 정보만으로 작성할 수 있다. 과장하지 않고 문장은 짧게 쓴다. 신뢰할 수 있는 드라이버·팀 정보가 없으면 keyDriversOrTeams는 null로 반환한다.",
          },
          {
            role: "user",
            content: JSON.stringify(context),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "racenote_content",
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed (${response.status})`);
    }

    const raw: unknown = await response.json();
    let parsed: unknown;
    try {
      parsed = JSON.parse(readOutputText(raw));
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error("OpenAI structured output is invalid");
      throw error;
    }
    return parseAiContentFields(parsed);
  }
}
