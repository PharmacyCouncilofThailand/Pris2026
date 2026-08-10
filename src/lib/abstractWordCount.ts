export const ABSTRACT_SECTION_NAMES = [
  "background",
  "objective",
  "methods",
  "results",
  "conclusion",
] as const;

export const ABSTRACT_WORD_COUNT_POLICY =
  "ensemble-intl-pythainlp-50-50-v1" as const;

export type AbstractSectionName = (typeof ABSTRACT_SECTION_NAMES)[number];

export type AbstractWordCountRequest = {
  title: string;
  keywords: string;
  background: string;
  objective: string;
  methods: string;
  results: string;
  conclusion: string;
};

export type AbstractWordCountIssue = {
  code:
    | "TITLE_TOO_LONG"
    | "TOO_MANY_KEYWORDS"
    | "SECTION_TOO_SHORT"
    | "TOTAL_TOO_LONG";
  field: "title" | "keywords" | AbstractSectionName | "abstract";
  current: number;
  limit: number;
};

export type AbstractWordCountResponse = {
  success: true;
  policy: typeof ABSTRACT_WORD_COUNT_POLICY;
  limits: {
    titleMax: number;
    keywordMax: number;
    sectionMin: number;
    totalMax: number;
  };
  counts: {
    title: number;
    keywords: number;
    sections: Record<AbstractSectionName, number>;
    total: number;
  };
  issues: AbstractWordCountIssue[];
};

type FetchLike = typeof fetch;

export async function fetchAbstractWordCount(
  apiUrl: string,
  token: string,
  input: AbstractWordCountRequest,
  signal?: AbortSignal,
  fetchImpl: FetchLike = fetch,
): Promise<AbstractWordCountResponse> {
  const response = await fetchImpl(`${apiUrl}/api/abstracts/word-count`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal,
  });

  const body = await response.json();
  if (!response.ok || body.success !== true) {
    throw new Error(body.error || "Unable to calculate abstract word count");
  }
  if (body.policy !== ABSTRACT_WORD_COUNT_POLICY) {
    throw new Error(
      `Unsupported abstract word count policy: ${String(body.policy || "missing")}`,
    );
  }
  return body as AbstractWordCountResponse;
}
