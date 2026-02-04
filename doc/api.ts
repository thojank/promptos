export interface PromptGenerationResult {
  success: boolean;
  prompt_text: string;
  word_count: number;
  validation_passed: boolean;
  json_structure: object;
}

export interface ImageAnalysisResult {
  // The structure here is complex, based on nano banana pro json template.md
  [key: string]: any;
}

export async function generatePromptFromText(
  text: string
): Promise<PromptGenerationResult> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // FastAPI's `str` body parameter expects form data
  const formData = new URLSearchParams();
  formData.append("text_input", text);

  const response = await fetch(`${backendUrl}/api/text-to-prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "An unknown error occurred.");
  }

  return response.json();
}

export async function generateJsonFromImage(
  file: File
): Promise<ImageAnalysisResult> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${backendUrl}/api/image-to-json`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'An unknown error occurred.');
  }

  return response.json();
}