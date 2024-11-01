import { defineStore } from "pinia";
import {
    callCreateFormSession,
    callGetFormStoryboard,
    callSubmitForm,
    callGetForm,
    callUploadFiles,
} from "@/api/conversation";
import { evaluateGotoLogic, isBlockVisible } from "./helpers/logic";
import { createFlatQueue } from "./helpers/queue";
import { Ref, ref } from "vue";

type ConversationStore = {
    form?: PublicFormModel;
    session?: FormSessionModel;
    storyboard: PublicFormBlockModel[] | null;
    queue: PublicFormBlockModel[] | null;
    current: PublicFormBlockModel["id"] | null;
    payload: FormSubmitPayload;
    isProcessing: boolean;
    isSubmitted: boolean;
    isInputMode: boolean;
    uploads: FormFileUploads;
};

export const useConversation = defineStore("form", {
    state: (): ConversationStore => {
        return {
            form: undefined,
            session: undefined,
            storyboard: null,
            queue: null,
            current: null,
            payload: {},
            isProcessing: false,
            isSubmitted: false,
            isInputMode: false,
            uploads: {},
        };
    },

    getters: {
        isFirstBlock(): boolean {
            if (!this.processedQueue) {
                return false;
            }

            return this.currentBlockIndex === 0;
        },

        isLastBlock(): boolean {
            if (!this.processedQueue) {
                return false;
            }

            return this.currentBlockIndex + 1 >= this.processedQueue.length;
        },

        processedQueue(state): PublicFormBlockModel[] {
            if (!state.queue) {
                return [];
            }

            return state.queue
                .filter((block) => isBlockVisible(block, state.payload))
                .filter((block) => block.type !== "group");
        },

        currentBlockIndex(state): number {
            return this.processedQueue.findIndex(
                (block) => block.id === state.current,
            );
        },

        currentBlock(): PublicFormBlockModel | null {
            if (!this.processedQueue || !this.processedQueue.length) {
                return null;
            }

            if (this.currentBlockIndex === -1) {
                return null;
            }

            try {
                return this.processedQueue[this.currentBlockIndex];
            } catch (e) {
                console.warn("Current block not found in processed queue", e);
                return null;
            }
        },

        currentPayload(
            state,
        ): FormBlockInteractionPayload | FormBlockInteractionPayload[] | null {
            if (!state.current) return null;

            if (state.payload[state.current]) {
                return state.payload[state.current];
            }

            return null;
        },

        submittablePayload(): FormSubmitPayload {
            const submittablePayload = Object.assign({}, this.payload);

            for (const block in this.payload) {
                const blockPayload = this.payload[block];

                if (Array.isArray(blockPayload)) {
                    continue;
                }

                if (
                    Array.isArray(blockPayload.payload) &&
                    blockPayload.payload.some((f) => f instanceof File)
                ) {
                    submittablePayload[block] = {
                        ...blockPayload,
                        payload: blockPayload.payload
                            .map((f) => f.name)
                            .join(", "),
                    };
                }
            }

            return submittablePayload;
        },

        countCurrentSelections(): number {
            if (!this.currentPayload) return 0;

            if (Array.isArray(this.currentPayload)) {
                return this.currentPayload.length;
            }

            return 1;
        },

        hasRequiredFields(): boolean {
            if (!this.currentBlock) return false;

            if (this.currentBlock.is_required) {
                return true;
            }
            this.currentBlock.interactions.forEach((interaction) => {
                if (interaction.options?.required) {
                    return true;
                }
            });

            return false;
        },

        /**
         * This getter determines if the user has entered content that is not saved yet.
         * For now that is the case once a user typed something in and is at least
         * on a second block.
         *
         * @param state
         * @returns true | false
         */
        hasUnsavedPayload(state): Ref<boolean> {
            return ref(
                !state.isSubmitted &&
                    state.payload &&
                    Object.keys(state.payload).length > 0,
            );
        },

        callToActionUrl(state): string | null {
            if (!state.form || !state.session) {
                return null;
            }

            const params = new URLSearchParams();

            // we should always attach the session id as a query parameter
            if (state.form.cta_append_session_id && state.session.token) {
                params.append("ipt_session", state.session.token);
            }

            if (
                state.form.cta_append_params &&
                state.session.params &&
                Object.keys(state.session.params).length > 0
            ) {
                for (const key of Object.keys(state.session.params)) {
                    params.append(key, state.session.params[key]);
                }
            }

            if ([...params].length) {
                return state.form.cta_link + "?" + params.toString();
            }

            return state.form.cta_link;
        },

        uploadsPayload(state): Record<string, FormBlockUploadPayload> {
            const uploads = {};

            for (const block in state.payload) {
                const blockPayload = state.payload[block];

                if (Array.isArray(blockPayload)) {
                    continue;
                }

                if (
                    Array.isArray(blockPayload.payload) &&
                    blockPayload.payload.some((f) => f instanceof File)
                ) {
                    uploads[block] = blockPayload;
                }
            }

            return uploads;
        },

        hasFileUploads(state): boolean {
            return Object.values(state.payload).some((block) => {
                if (!Array.isArray(block) && Array.isArray(block.payload)) {
                    return block.payload.some((p) => {
                        return p instanceof File;
                    });
                }
            });
        },

        uploadProgress(state): number | false {
            if (Object.values(state.uploads).length === 0) {
                return false;
            }

            const total = Object.values(state.uploads).reduce(
                (acc, val) => acc + val.total,
                0,
            );

            const loaded = Object.values(state.uploads).reduce(
                (acc, val) => acc + val.loaded,
                0,
            );

            return Math.min(100, Math.round((loaded / total) * 100));
        },
    },

    actions: {
        async initForm(
            initialPayload: string | PublicFormModel,
            params: Record<string, string>,
        ) {
            const id =
                typeof initialPayload === "string"
                    ? initialPayload
                    : initialPayload.uuid;

            if (typeof initialPayload !== "string") {
                this.form = initialPayload as PublicFormModel;
            } else {
                try {
                    const response = await callGetForm(id);
                    this.form = response.data;
                } catch (error) {
                    console.warn(error);
                    return;
                }
            }

            const [formSessionResponse, storyboardResponse] = await Promise.all(
                [callCreateFormSession(id, params), callGetFormStoryboard(id)],
            );

            this.session = formSessionResponse.data;
            this.storyboard = storyboardResponse.data.blocks;

            this.queue = createFlatQueue(this.storyboard);

            this.current = this.processedQueue[0].id ?? null;
        },

        enableInputMode() {
            this.isInputMode = true;
        },

        disableInputMode() {
            this.isInputMode = false;
        },

        setResponse(
            action: PublicFormBlockInteractionModel,
            value: string | boolean | number | File[] | null,
        ) {
            if (!this.current) return;

            this.payload[this.current] = {
                payload: value,
                actionId: action.id,
            };
        },

        toggleResponse(
            action: PublicFormBlockInteractionModel,
            value:
                | Record<string, string | boolean | null>
                | string
                | boolean
                | null,
            keepChecked: boolean | null = null,
        ) {
            if (!this.current) return;

            const givenPayload = {
                payload: value,
                actionId: action.id,
            };
            const currentPayload = this.payload[this.current];

            if (!Array.isArray(currentPayload)) {
                this.payload[this.current] = [givenPayload];
            } else {
                const foundIndex = currentPayload.findIndex(
                    (p) => p.actionId === action.id,
                );

                if (foundIndex === -1) {
                    currentPayload.push(givenPayload);
                } else {
                    if (keepChecked) {
                        currentPayload.splice(foundIndex, 1, givenPayload);
                    } else {
                        currentPayload.splice(foundIndex, 1);
                    }
                }
            }
        },

        findBlockIndex(blockId: string): number {
            return this.processedQueue.findIndex(
                (block) => block.id === blockId,
            );
        },

        goToIndex(index: number) {
            if (index >= 0 && index < this.processedQueue.length) {
                this.current = this.processedQueue[index].id;
            } else {
                console.warn("Index out of bounds", index);
            }
        },

        executeGotoAction(targetBlockId: string) {
            const targetIndex = this.findBlockIndex(targetBlockId);
            if (targetIndex !== -1) {
                this.goToIndex(targetIndex);
            } else {
                console.warn(
                    `Target block ${targetBlockId} not found in processed queue`,
                );
            }
        },

        back() {
            if (this.isFirstBlock) {
                return;
            }

            this.goToIndex(this.currentBlockIndex - 1);
        },

        /**
         * Increases current block by one or submits form if last block is triggered.
         * @returns {Promise<boolean>}
         */
        async next(): Promise<boolean> {
            const gotoAction = this.currentBlock
                ? evaluateGotoLogic(this.currentBlock, this.payload)
                : null;

            if (gotoAction && gotoAction.target) {
                this.executeGotoAction(gotoAction.target);
                return Promise.resolve(false);
            }

            if (this.isLastBlock) {
                this.uploads = {};
                this.isProcessing = true;

                if (this.form?.uuid && this.session?.token) {
                    await callSubmitForm(
                        this.form.uuid,
                        this.session.token,
                        this.submittablePayload,
                        this.hasFileUploads,
                    );

                    if (this.hasFileUploads) {
                        // init file upload state
                        this.initFileUpload();

                        // upload files
                        await callUploadFiles(
                            this.form.uuid,
                            this.session.token,
                            this.uploadsPayload,
                            (action, progressEvent) => {
                                try {
                                    this.uploads[action].loaded =
                                        progressEvent.loaded;
                                } catch (e) {
                                    console.warn(
                                        "could not update upload progress",
                                        e,
                                    );
                                }
                            },
                        );

                        await callSubmitForm(
                            this.form.uuid,
                            this.session.token,
                            null,
                            false,
                        );
                    }

                    // If a redirect is configured, we redirect the user to the given url
                    if (this.form.use_cta_redirect && this.callToActionUrl) {
                        window.location.href = this.callToActionUrl;

                        return Promise.resolve(true);
                    }

                    this.isSubmitted = true;
                    this.isProcessing = false;

                    return Promise.resolve(true);
                } else {
                    this.isProcessing = false;
                    return Promise.reject(new Error("Form or session not set"));
                }
            } else {
                this.goToIndex(this.currentBlockIndex + 1);

                return Promise.resolve(false);
            }
        },

        initFileUpload() {
            Object.values(this.uploadsPayload).forEach((value) => {
                value.payload.forEach((file: File, index: number) => {
                    this.uploads[`${value.actionId}[${index}]`] = {
                        total: file.size,
                        loaded: 0,
                    };
                });
            });
        },
    },
});
