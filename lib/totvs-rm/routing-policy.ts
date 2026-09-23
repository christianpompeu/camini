import { ComplexityResult, RoutingDecision, RoutingMode } from "./types";
import { LlmProviderId } from "./llm/providers";

/**
 * Interface that provides environment configuration for routing
 */
export interface RoutingConfig {
  mode: string; // "static" | "complexity"
  staticGeneratorProvider?: string;
  staticGeneratorModel?: string;

  simpleGeneratorProvider?: string;
  simpleGeneratorModel?: string;

  moderateGeneratorProvider?: string;
  moderateGeneratorModel?: string;

  complexGeneratorProvider?: string;
  complexGeneratorModel?: string;

  // Global provider models from .env
  envOpenAiModel?: string;
  envGroqModel?: string;
  envGeminiModel?: string;
}

/**
 * Deterministically decides the routing strategy based on complexity and environment config.
 * Escalation boundaries can also be defined here.
 */
export function determineRoutingStrategy(
  complexity: ComplexityResult,
  config: RoutingConfig
): RoutingDecision {
  const mode: RoutingMode = config.mode === "complexity" ? "complexity" : "static";

  let preferredProvider = "gemini"; // fallback default
  let preferredModel = config.envGeminiModel || "gemini-1.5-pro-latest"; // absolute last fallback if env is completely empty
  let allowRepair = true;
  let allowEscalation = false; // Escalation is only true in complexity mode

  if (mode === "static") {
    // Preserve backward compatibility from Phase E
    preferredProvider = config.staticGeneratorProvider || "gemini";
    preferredModel = config.staticGeneratorModel || resolveProviderModel(preferredProvider, config);
    // In static mode, we allow repair, but no escalation to other models/providers
    allowEscalation = false;
  } else {
    // Complexity-based routing
    allowEscalation = true; // allow one level of escalation on failure

    if (complexity.level === "simple") {
      preferredProvider = config.simpleGeneratorProvider || "gemini";
      preferredModel = config.simpleGeneratorModel || resolveProviderModel(preferredProvider, config);
    } else if (complexity.level === "moderate") {
      preferredProvider = config.moderateGeneratorProvider || "groq";
      preferredModel = config.moderateGeneratorModel || resolveProviderModel(preferredProvider, config);
    } else { // complex
      preferredProvider = config.complexGeneratorProvider || "openai";
      preferredModel = config.complexGeneratorModel || resolveProviderModel(preferredProvider, config);
    }
  }

  // Sanitize provider ID
  if (!["gemini", "groq", "openai", "openrouter"].includes(preferredProvider.toLowerCase())) {
    preferredProvider = "gemini";
  }

  return {
    strategy: mode,
    preferredProvider,
    preferredModel,
    allowRepair,
    allowEscalation
  };
}

function resolveProviderModel(provider: string, config: RoutingConfig): string {
  const p = provider.toLowerCase();
  if (p === "groq") return config.envGroqModel || "llama3-70b-8192";
  if (p === "openai") return config.envOpenAiModel || "gpt-4o";
  return config.envGeminiModel || "gemini-1.5-pro-latest";
}

/**
 * Returns the fallback (escalation) route.
 * E.g., if we are on 'gemini' and it fails, we escalate to 'openai' or 'groq'.
 */
export function determineEscalationRoute(
  currentProvider: string,
  currentModel: string,
  config: RoutingConfig
): { provider: string; model: string } | null {
  const p = currentProvider.toLowerCase();
  
  // Escalation policy:
  // 1. Try to escalate to OpenAI
  if (process.env.OPENAI_API_KEY && config.envOpenAiModel) {
    if (p !== "openai" || currentModel !== config.envOpenAiModel) {
      return { provider: "openai", model: config.envOpenAiModel };
    }
  }
  
  // 2. Try Groq
  if (process.env.GROQ_API_KEY && config.envGroqModel) {
    if (p !== "groq" || currentModel !== config.envGroqModel) {
      return { provider: "groq", model: config.envGroqModel };
    }
  }

  // 3. Try Gemini
  if (process.env.GEMINI_API_KEY && config.envGeminiModel) {
    if (p !== "gemini" || currentModel !== config.envGeminiModel) {
      return { provider: "gemini", model: config.envGeminiModel };
    }
  }
  
  // Cannot escalate further (no valid alternative route available)
  return null;
}

/**
 * Deterministically decides if a SQL that failed Verification is eligible for Repair.
 */
export function isRepairEligible(problems: { message: string }[]): boolean {
  if (problems.length === 0) return false;
  
  // We can repair most structural/grounding errors.
  // Example of unrepairable: completely unknown intent, or explicit instruction not to repair.
  for (const problem of problems) {
    const msg = problem.message.toLowerCase();
    if (msg.includes("contexto insuficiente para reparo")) {
      return false;
    }
  }
  return true; // Most errors like PARSE_ERROR, JOIN_NOT_GROUNDED, UNKNOWN_TABLE are eligible for repair attempt
}
