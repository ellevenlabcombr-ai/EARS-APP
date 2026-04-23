
export type SessionDecision = "full_train" | "modified_train" | "recovery" | "hold";
export type ConfidenceLevel = "low" | "moderate" | "high";

export interface PriorityInput {
  decision: SessionDecision;
  confidence: ConfidenceLevel;
  riskScore: number;
  trendScore: number;
  factors: string[];
  actions: string[];
  tags: string[];
}

export interface ExecutionStep {
  title: string;
  items: string[];
}

export interface PriorityOutput {
  visibleBlocks: string[];
  content: {
    factors: string[];
    actions: string[];
    tags: string[];
    executionPlan: ExecutionStep[];
  };
  showWarning: boolean;
  adjustedDecision: SessionDecision;
}

export const PriorityEngine = {
  process: (input: PriorityInput): PriorityOutput => {
    let { decision, confidence, factors, actions, tags } = input;
    let showWarning = confidence === "low";
    let adjustedDecision = decision;

    // Confidence Adjustment: Avoid extreme "hold" if confidence is low
    if (confidence === "low" && decision === "hold") {
      adjustedDecision = "modified_train";
    }

    // Determine visible blocks based on adjusted decision
    const visibleBlocks: string[] = ["DecisionHeader"];

    if (adjustedDecision === "hold") {
      visibleBlocks.push("SessionRules", "KeyFactors", "ExecutionPlan", "ConfidenceBadge");
    } else if (adjustedDecision === "modified_train") {
      visibleBlocks.push("ExecutionPlan", "FocusTags", "TrendPanel", "MetricsPanel");
    } else if (adjustedDecision === "recovery") {
      visibleBlocks.push("ExecutionPlan", "TrendPanel", "ConfidenceBadge");
    } else if (adjustedDecision === "full_train") {
      visibleBlocks.push("TrendPanel", "MetricsPanel");
    }

    if (showWarning) {
      visibleBlocks.push("WarningBanner");
    }

    // Filter and Limit Content
    const uniqueFactors = Array.from(new Set(factors)).slice(0, 3);
    const uniqueActions = Array.from(new Set(actions)).slice(0, 4);
    const uniqueTags = Array.from(new Set(tags)).slice(0, 2);

    const executionPlan = PriorityEngine.mapToExecutionPlan(uniqueActions);

    return {
      visibleBlocks,
      content: {
        factors: uniqueFactors,
        actions: uniqueActions,
        tags: uniqueTags,
        executionPlan
      },
      showWarning,
      adjustedDecision
    };
  },

  /**
   * Maps raw actions into a structured execution plan.
   * Prepared for future division (warmup, main, recovery)
   */
  mapToExecutionPlan: (actions: string[]): ExecutionStep[] => {
    // Current simple mapping as per prompt
    return [
      {
        title: "Protocolo de Execução",
        items: actions
      }
    ];
  }
};
