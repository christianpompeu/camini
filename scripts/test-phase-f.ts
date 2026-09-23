import { classifyQueryComplexity } from "../lib/totvs-rm/complexity";
import { determineRoutingStrategy, determineEscalationRoute, RoutingConfig } from "../lib/totvs-rm/routing-policy";
import { SemanticPlan } from "../lib/totvs-rm/types";

// Helper for assertions
function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`ASSERTION FAILED: ${message}. Expected '${expected}', got '${actual}'`);
  }
}

function runTests() {
  console.log("Running Phase F Offline Tests...\n");

  // 1. Complexity Tests
  console.log("--- Testing Complexity Classification ---");
  
  // SIMPLE
  const simplePlan: SemanticPlan = {
    intent: "listar fornecedores",
    domains: ["global"],
    entities: ["fornecedor"],
    filters: [{ concept: "coligada", operator: "=" }],
    requestedFields: ["nome"],
    operations: ["select", "filter"],
    aggregations: [],
    ordering: [],
    grouping: [],
    temporalRequirements: [],
    candidateTables: ["FCFO"]
  };
  const simpleContext = {
    routerTables: ["FCFO"],
    seedTables: ["FCFO"],
    expandedTables: [],
    finalAllowedTables: ["FCFO"]
  };
  
  const simpleResult = classifyQueryComplexity(simplePlan, simpleContext);
  assertEqual(simpleResult.level, "simple", "Simple plan should be simple");
  console.log("PASS: Simple Query Classification");

  // MODERATE
  const moderatePlan: SemanticPlan = {
    ...simplePlan,
    intent: "listar movimentos e formas de pagamento",
    domains: ["movimento", "financeiro"],
    aggregations: ["SUM"],
    candidateTables: ["TMOV", "FLAN"]
  };
  const moderateContext = {
    routerTables: ["TMOV", "FLAN"],
    seedTables: ["TMOV", "FLAN"],
    expandedTables: ["FLANMOV"],
    finalAllowedTables: ["TMOV", "FLAN", "FLANMOV"]
  };
  
  const moderateResult = classifyQueryComplexity(moderatePlan, moderateContext);
  assertEqual(moderateResult.level, "moderate", "Moderate plan should be moderate");
  console.log("PASS: Moderate Query Classification");

  // COMPLEX
  const complexPlan: SemanticPlan = {
    ...simplePlan,
    intent: "comparar total recebido nos ultimos 12 meses",
    domains: ["movimento", "financeiro", "global"],
    aggregations: ["SUM", "MAX"],
    temporalRequirements: ["últimos 12 meses", "variação 20%"],
    operations: ["select", "join", "subquery", "filter"],
    candidateTables: ["TMOV", "FLAN", "FCFO"]
  };
  const complexContext = {
    routerTables: ["TMOV", "FLAN", "FCFO"],
    seedTables: ["TMOV", "FLAN", "FCFO"],
    expandedTables: ["TMOVPAGTO", "TPAGTO", "FLANMOV"],
    finalAllowedTables: ["TMOV", "FLAN", "FCFO", "TMOVPAGTO", "TPAGTO", "FLANMOV"]
  };

  const complexResult = classifyQueryComplexity(complexPlan, complexContext);
  assertEqual(complexResult.level, "complex", "Complex plan should be complex");
  console.log("PASS: Complex Query Classification");

  // 2. Routing Policy Tests
  console.log("\n--- Testing Routing Policy ---");

  const baseConfig: RoutingConfig = {
    mode: "static",
    staticGeneratorProvider: "groq",
    simpleGeneratorProvider: "groq",
    moderateGeneratorProvider: "openai",
    complexGeneratorProvider: "openai",
    envGroqModel: "groq-global-model",
    envOpenAiModel: "openai-global-model",
    envGeminiModel: "gemini-global-model"
  };

  // Static Mode
  const staticDecision = determineRoutingStrategy(simpleResult, baseConfig);
  assertEqual(staticDecision.strategy, "static", "Strategy should be static");
  assertEqual(staticDecision.preferredProvider, "groq", "Should respect staticGeneratorProvider");
  assertEqual(staticDecision.preferredModel, "groq-global-model", "Should fall back to global groq model");
  assertEqual(staticDecision.allowEscalation, false, "Static mode should not allow escalation");
  console.log("PASS: Static Routing Mode (respects global provider model)");

  // Complexity Mode (Simple)
  const complexityConfig = { ...baseConfig, mode: "complexity" };
  const simpleDecision = determineRoutingStrategy(simpleResult, complexityConfig);
  assertEqual(simpleDecision.strategy, "complexity", "Strategy should be complexity");
  assertEqual(simpleDecision.preferredProvider, "groq", "Simple should map to simpleGeneratorProvider");
  assertEqual(simpleDecision.preferredModel, "groq-global-model", "Simple should fall back to global provider model if no specific override");
  assertEqual(simpleDecision.allowEscalation, true, "Complexity mode should allow escalation");
  console.log("PASS: Complexity Routing Mode (Simple)");

  // Override Mode (Moderate)
  const overrideConfig = { ...complexityConfig, moderateGeneratorModel: "custom-moderate-model" };
  const moderateDecision = determineRoutingStrategy(moderateResult, overrideConfig);
  assertEqual(moderateDecision.preferredProvider, "openai", "Moderate maps to openai here");
  assertEqual(moderateDecision.preferredModel, "custom-moderate-model", "Level specific override should win over global provider model");
  console.log("PASS: Complexity Routing Mode (Moderate Override)");

  // Escalation Test
  process.env.OPENAI_API_KEY = "test";
  process.env.GROQ_API_KEY = "test";
  
  // From groq to openai
  const esc1 = determineEscalationRoute("groq", "groq-global-model", overrideConfig);
  assertEqual(esc1?.provider, "openai", "Should escalate groq -> openai");
  assertEqual(esc1?.model, "openai-global-model", "Should pick global model for escalation");

  // Escalation should not repeat same route
  const esc2 = determineEscalationRoute("openai", "openai-global-model", overrideConfig);
  assertEqual(esc2?.provider, "groq", "Should escalate openai -> groq");
  
  console.log("PASS: Escalation logic replaces provider/model correctly without loops");

  // 3. Schema Validation Tests
  console.log("\n--- Testing SemanticPlan Schema Validation ---");
  
  function validateSemanticPlan(plan: any) {
    const required = ["intent", "domains", "entities", "filters", "requestedFields", "operations", "aggregations", "ordering", "grouping", "temporalRequirements", "candidateTables"];
    for (const req of required) {
      if (!(req in plan)) throw new Error(`Missing required field: ${req}`);
      if (!Array.isArray(plan[req]) && req !== "intent") throw new Error(`Field ${req} should be an array`);
    }
    
    // Check extra properties (strict)
    for (const key in plan) {
      if (!required.includes(key)) throw new Error(`Additional property not allowed: ${key}`);
    }

    // Check operator enum
    const validOperators = ["=", "!=", ">", "<", ">=", "<=", "IN", "NOT_IN", "LIKE", "BETWEEN", "IS_NULL", "IS_NOT_NULL"];
    for (const f of plan.filters) {
      if (!f.concept || !f.operator) throw new Error("Filter missing concept or operator");
      if (!validOperators.includes(f.operator)) throw new Error(`Invalid operator: ${f.operator}`);
    }
    
    return true;
  }

  // Valid payload
  try {
    validateSemanticPlan(simplePlan);
    console.log("PASS: Valid payload schema check");
  } catch (e: any) {
    throw new Error(`Valid payload failed: ${e.message}`);
  }

  // Invalid Operator
  try {
    const invalidPlan = { ...simplePlan, filters: [{ concept: "coligada", operator: "EQUALS" }] };
    validateSemanticPlan(invalidPlan);
    throw new Error("Should have failed on invalid operator");
  } catch (e: any) {
    if (!e.message.includes("Invalid operator")) throw e;
    console.log("PASS: Rejects invalid operator");
  }

  // Missing Field
  try {
    const missingFieldPlan = { ...simplePlan };
    delete (missingFieldPlan as any).operations;
    validateSemanticPlan(missingFieldPlan);
    throw new Error("Should have failed on missing field");
  } catch (e: any) {
    if (!e.message.includes("Missing required field")) throw e;
    console.log("PASS: Rejects missing required field");
  }

  // Additional Properties
  try {
    const extraPropPlan = { ...simplePlan, someExtraField: "hello" };
    validateSemanticPlan(extraPropPlan);
    throw new Error("Should have failed on additional properties");
  } catch (e: any) {
    if (!e.message.includes("Additional property not allowed")) throw e;
    console.log("PASS: Rejects additional properties");
  }

  console.log("\nAll Offline Tests Passed Successfully! ZERO LLM calls made.");
}

runTests();
