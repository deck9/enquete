import { useForm } from "@/stores";
import { defineStore } from "pinia";
import { findAllBlocksBeforeTarget } from "./helpers/queue";

import {
    callCreateFormBlockLogic,
    callUpdateFormBlockLogic,
    callDeleteFormBlockLogic,
} from "@/api/logics";

import { transformConditionForBackend } from "./helpers/logic";

interface LogicStore {
    block: FormBlockModel | null;
    validation: ValidationError[];
    isShowingLogicEditor: boolean;
    hideRule: FormBlockLogic | null;
    backup: FormBlockLogic[] | null;
}

export const useLogic = defineStore("logic", {
    state: (): LogicStore => {
        return {
            block: null,
            isShowingLogicEditor: false,
            hideRule: null,
            validation: [],
            backup: null,
        };
    },

    actions: {
        showLogicEditor(block: FormBlockModel) {
            this.block = block;
            this.backupLogic();
            this.isShowingLogicEditor = true;
        },

        hideLogicEditor() {
            this.block = null;
            this.isShowingLogicEditor = false;
        },

        backupLogic() {
            this.backup = this.block?.logics ?? null;
        },

        restoreLogic() {
            if (!this.block) {
                return;
            }

            this.block.logics = this.backup ?? undefined;
        },

        addRule() {
            if (!this.block) {
                return;
            }

            if (!this.block.logics) {
                this.block.logics = [];
            }

            this.block.logics.push({
                form_block_id: this.block.id,
                name: "Rule #" + (this.block.logics.length + 1),
                action: "hide",
                action_payload: null,
                evaluate: "before",
                conditions: [],
            });
        },

        async removeRule(index: number) {
            if (!this.block || !this.block.logics) {
                return;
            }

            if (this.block.logics[index].id === undefined) {
                this.block.logics.splice(index, 1);
                return;
            }

            try {
                const response = await callDeleteFormBlockLogic(
                    this.block.logics[index],
                );

                if (response.status === 200) {
                    this.block.logics.splice(index, 1);
                }
            } catch (error) {
                console.warn(`Error deleting rule:`, error);
            }
        },

        async saveBlockLogic() {
            if (!this.block || !this.block.logics) {
                return;
            }

            // reset validation before each request
            this.validation = [];

            const results = await Promise.allSettled(
                this.block.logics.map((logic, index) =>
                    this.saveSingleRule(logic).then((result) => ({
                        result,
                        index,
                    })),
                ),
            );

            const failedSaves = results
                .map((result, index) => ({ ...result, originalIndex: index }))
                .filter(
                    (
                        result,
                    ): result is PromiseRejectedResult & {
                        originalIndex: number;
                    } => result.status === "rejected",
                );

            if (failedSaves.length > 0) {
                failedSaves.forEach((failure) => {
                    this.validation[failure.originalIndex] =
                        failure.reason.response.data;
                });
            }

            return {
                failed: failedSaves.length,
                totalRules: this.block.logics.length,
            };
        },

        async saveSingleRule(logic: FormBlockLogic) {
            if (!this.block) {
                throw new Error("Block is not defined");
            }

            try {
                if (!logic.uuid) {
                    const response = await callCreateFormBlockLogic(
                        this.block.id,
                        logic,
                    );
                    if (response.status === 201) {
                        return response.data;
                    } else {
                        throw new Error(
                            `Unexpected response status: ${response.status}`,
                        );
                    }
                } else {
                    const response = await callUpdateFormBlockLogic(logic);

                    if (response.status === 200) {
                        return response.data;
                    } else {
                        throw new Error(
                            `Unexpected response status: ${response.status}`,
                        );
                    }
                }
            } catch (error) {
                console.warn(`Error saving rule:`, error);
                throw error;
            }
        },

        updateBlockLogic(logic: FormBlockLogic, index: number) {
            if (!this.block) {
                return;
            }

            if (!this.block.logics) {
                this.block.logics = [];
            }

            const transformedConditions = logic.conditions.map((c) =>
                transformConditionForBackend(c),
            );

            logic.conditions = transformedConditions;

            this.block.logics[index] = logic;
        },
    },

    getters: {
        allBlocks(): Array<FormBlockModel> | null {
            const formStore = useForm();

            return formStore.blocks;
        },

        availableSourceBlocksWithTarget(state): Array<FormBlockModel> {
            const formStore = useForm();

            if (!state.block?.uuid) {
                return [];
            }

            return findAllBlocksBeforeTarget(
                formStore.blocksTree,
                state.block.uuid,
                { filterGroups: true, includeTarget: true },
            );
        },

        availableSourceBlocks(state): Array<FormBlockModel> {
            const formStore = useForm();

            if (!state.block?.uuid) {
                return [];
            }

            return findAllBlocksBeforeTarget(
                formStore.blocksTree,
                state.block.uuid,
                { filterGroups: true, includeTarget: false },
            );
        },
    },
});
