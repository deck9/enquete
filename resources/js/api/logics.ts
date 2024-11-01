/* eslint-disable no-async-promise-executor */
import { AxiosResponse } from "axios";
import handler from "./handler";

export function callCreateFormBlockLogic(
    id: number,
    attributes: Partial<FormBlockLogic>,
): Promise<AxiosResponse<FormBlockLogic>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.logics.create", { block: id }),
                {
                    ...attributes,
                },
            );

            resolve(response as AxiosResponse<FormBlockLogic>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callUpdateFormBlockLogic(
    attributes: Partial<FormBlockLogic>,
): Promise<AxiosResponse<FormBlockLogic>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.post(
                window.route("api.logics.update", { logic: attributes.id }),
                {
                    ...attributes,
                },
            );

            resolve(response as AxiosResponse<FormBlockLogic>);
        } catch (error) {
            reject(error);
        }
    });
}

export function callDeleteFormBlockLogic(
    attributes: Partial<FormBlockLogic>,
): Promise<AxiosResponse<FormBlockLogic>> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await handler.delete(
                window.route("api.logics.delete", { logic: attributes.id }),
            );

            resolve(response as AxiosResponse<FormBlockLogic>);
        } catch (error) {
            reject(error);
        }
    });
}
