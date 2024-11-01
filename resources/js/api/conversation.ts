/* eslint-disable no-async-promise-executor */
import { AxiosProgressEvent, AxiosResponse } from "axios";
import handler from "./handler";
import { useRoutes } from "@/utils/useRoutes";

await useRoutes();

export function callGetForm(
    uuid: string,
): Promise<AxiosResponse<PublicFormModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = await useRoutes();

            const resolvedRoute = route("api.public.forms.show", {
                uuid,
            });

            if (resolvedRoute) {
                const response = await handler.get(resolvedRoute);
                resolve(response as AxiosResponse<PublicFormModel>);
            } else {
                reject("route not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callGetFormStoryboard(
    uuid: string,
): Promise<AxiosResponse<FormStoryboard>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = await useRoutes();

            const resolvedRoute = route("api.public.forms.storyboard", {
                uuid,
            });

            if (resolvedRoute) {
                const response = await handler.get(resolvedRoute);
                resolve(response as AxiosResponse<FormStoryboard>);
            } else {
                reject("route not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callCreateFormSession(
    uuid: string,
    params: Record<string, string>,
): Promise<AxiosResponse<FormSessionModel>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = await useRoutes();

            const resolvedRoute = route("api.public.forms.session.create", {
                uuid,
            });

            if (resolvedRoute) {
                const response = await handler.post(resolvedRoute, {
                    params,
                });
                resolve(response as AxiosResponse<FormSessionModel>);
            } else {
                reject("route not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function callSubmitForm(
    uuid: string,
    token: string,
    payload: FormSubmitPayload | null,
    is_uploading: boolean = false,
): Promise<AxiosResponse<null>> {
    return new Promise(async (resolve, reject) => {
        try {
            const { route } = await useRoutes();

            const resolvedRoute = route("api.public.forms.submit", {
                uuid,
            });

            if (resolvedRoute) {
                const response = await handler.post(resolvedRoute, {
                    token,
                    payload,
                    is_uploading,
                });
                resolve(response as AxiosResponse<null>);
            } else {
                reject("route not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}

export async function callUploadFiles(
    uuid: string,
    token: string,
    payload: FormSubmitPayload,
    progressCallback: (file, axiosProgressEvent: AxiosProgressEvent) => void,
): Promise<AxiosResponse[]> {
    const { route } = await useRoutes();

    const resolvedRoute = route("api.public.forms.file-upload", {
        uuid,
    });

    if (!resolvedRoute) {
        return Promise.reject("route not found");
    }

    const requests: Promise<AxiosResponse>[] = [];

    Object.values(payload).forEach((value) => {
        if (Array.isArray(value)) {
            return;
        }

        value.payload.forEach((file: any, index: number) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("token", token);
            formData.append("actionId", value.actionId);

            requests.push(
                handler.post(resolvedRoute, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        progressCallback(
                            `${value.actionId}[${index}]`,
                            progressEvent,
                        );
                    },
                }),
            );
        });
    });

    return await Promise.all(requests);
}
