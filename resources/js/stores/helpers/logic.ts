import { should } from "vitest";

export const operators: Array<{ key: Operator; label: string }> = [
    { key: "equals", label: "is equal to" },
    { key: "equalsNot", label: "is not equal to" },
    { key: "contains", label: "contains" },
    { key: "containsNot", label: "does not contain" },
    { key: "isLowerThan", label: "is lower than" },
    { key: "isGreaterThan", label: "is greater than" },
];

export function evaluateCondition(
    condition: FormBlockLogicCondition,
    responseValue: any,
): boolean {
    switch (condition.operator) {
        case "equals":
            return responseValue === condition.value;
        case "equalsNot":
            return responseValue !== condition.value;
        case "contains":
            return responseValue.includes(condition.value);
        case "containsNot":
            return !responseValue.includes(condition.value);
        case "isLowerThan":
            return responseValue < condition.value;
        case "isGreaterThan":
            return responseValue > condition.value;
        default:
            return false;
    }
}

export function getResponseValue(response: any): any {
    return "payload" in response
        ? response.payload
        : response.map((p) => p.payload).join(", ");
}

export function groupConditions(
    evaluatedConditions: FormBlockLogicCondition[],
): FormBlockLogicCondition[][] {
    const groups: FormBlockLogicCondition[][] = [];
    let currentIndex = 0;

    evaluatedConditions.forEach((condition, index) => {
        if (index === 0) {
            groups[currentIndex] = [condition];
        } else {
            if (condition.chainOperator === "or") {
                currentIndex++;
            }
            if (!groups[currentIndex]) {
                groups[currentIndex] = [];
            }
            groups[currentIndex].push(condition);
        }
    });

    return groups;
}

export function evaluateConditions(
    conditions: FormBlockLogicCondition[],
    responses: FormSubmitPayload,
): FormBlockLogicCondition[] {
    return conditions.map((condition) => ({
        ...condition,
        result:
            condition.source && responses[condition.source]
                ? evaluateCondition(
                      condition,
                      getResponseValue(responses[condition.source]),
                  )
                : false,
    }));
}

export function evaluateLogicRule(
    logic: FormBlockLogic,
    responses: FormSubmitPayload,
): boolean {
    const evaluatedConditions = evaluateConditions(
        logic.conditions as FormBlockLogicCondition[],
        responses,
    );
    const conditionGroups = groupConditions(evaluatedConditions);

    const finalResult = conditionGroups.some((group) =>
        group.every((condition) => condition.result),
    );

    switch (logic.action) {
        case "show":
        case "goto":
            return finalResult;
        case "hide":
            return !finalResult;
    }
}

export function isBlockVisible(
    block: PublicFormBlockModel,
    responses: FormSubmitPayload,
): boolean {
    if (!block.logics?.length) {
        return true;
    }

    const beforeLogics = block.logics.filter(
        (logic) =>
            logic.evaluate === "before" ||
            logic.action === "show" ||
            logic.action === "hide",
    );

    // If any logic rule returns false, the block is not visible
    return beforeLogics.every((logic) => evaluateLogicRule(logic, responses));
}

export function evaluateGotoLogic(
    block: PublicFormBlockModel,
    payload: FormSubmitPayload,
): { target: string } | null {
    if (!block?.logics) return null;

    // Find goto actions that should be evaluated after block interaction
    const gotoLogics = block.logics.filter(
        (logic) => logic.action === "goto" && logic.evaluate === "after",
    );

    for (const logic of gotoLogics) {
        const shouldExecute = evaluateLogicRule(logic, payload);

        if (shouldExecute && logic.action_payload) {
            return { target: logic.action_payload };
        }
    }

    return null;
}

export function transformConditionForBackend(
    condition: EditableFormBlockBlockLogicCondition,
): FormBlockLogicCondition {
    return {
        ...condition,
        source: condition.source?.key,
        operator: condition.operator.key,
    };
}
