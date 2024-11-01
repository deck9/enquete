interface BaseModel {
    [key: string]: any;
    id: number;
    uuid: string;
    created_at: string;
    updated_at: string;
}

interface FormModel extends BaseModel {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    avatar_path: string | null;
    avatar: string | null;
    preview_image_path: string | null;
    brand_color: string | null;
    background_color: string | null;
    text_color: string | null;
    contrast_color: string | null;
    interaction_text_color: string | null;
    interaction_background_color: string | null;
    user_message_text_color: string | null;
    user_message_background_color: string | null;
    user_message_text_color: string | null;
    user_message_background_color: string | null;
    use_brighter_inputs: boolean | null;
    show_form_progress: boolean | null;
    eoc_text: string | null;
    eoc_headline: string | null;
    data_retention_days: number | null;
    is_auto_delete_enabled: boolean;
    legal_notice_link: string | null;
    privacy_link: string | null;
    has_data_privacy: boolean;
    cta_label: string | null;
    cta_link: string | null;
    linkedin: string | null;
    github: string | null;
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    show_cta_link: boolean;
    show_social_links: boolean;
    is_notification_via_mail: boolean;
    user_id: number;
    total_sessions: number;
    completed_sessions: number;
    completion_rate: number;
    is_published: boolean;
    is_trashed: boolean;
    initials: string | null;
    published_at: string | null;
    deleted_at: string | null;
}

interface FormWebhookModel extends BaseModel {
    name: string;
    webhook_url: string;
    webhook_method: string;
    provider: string;
    has_provider: boolean;
    is_enabled: boolean;
    headers: Record<string, string> | null;
}

interface TreeNode {
    block: FormBlockModel;
    children: TreeNode[];
}

type Operator =
    | "equals"
    | "equalsNot"
    | "contains"
    | "containsNot"
    | "isLowerThan"
    | "isGreaterThan";

interface FormBlockLogicCondition {
    source?: FormBlockModel["uuid"];
    operator?: Operator;
    value: string;
    chainOperator: "or" | "and";
    result?: boolean;
}

interface EditableFormBlockBlockLogicCondition extends FormBlockLogicCondition {
    source?: { key: FormBlockModel["uuid"] };
    operator: { key: Operator };
}

interface ValidationError {
    message: string;
    errors: Record<string, string[]>;
}

interface FormBlockLogic {
    id?: number;
    uuid?: string;
    form_block_id: number;
    name: string;
    conditions:
        | Array<FormBlockLogicCondition>
        | Array<EditableFormBlockBlockLogicCondition>;
    action: "show" | "hide" | "goto";
    action_payload: string | null;
    evaluate: "before" | "after";
}

interface FormBlockModel extends BaseModel {
    type: FormBlockType;
    message: string | null;
    title: string | null;
    options: Record<string, any> | null;
    responses: string | null;
    parent_block: string | null;
    is_required: boolean | null;
    is_disabled: boolean | null;
    webhook_url: string;
    sequence: number;
    form_id: number;
    interactions: FormBlockInteractionModel[] | undefined;
    logics: FormBlockLogic[] | undefined;
}

type FormBlockType =
    | "none"
    | "group"
    | "consent"
    | "input-short"
    | "input-long"
    | "checkbox"
    | "radio"
    | "input-number"
    | "input-email"
    | "input-link"
    | "input-phone"
    | "input-secret"
    | "input-file"
    | "scale"
    | "rating"
    | "date";

type FormBlockInteractionType =
    | "button"
    | "input"
    | "textarea"
    | "consent"
    | "range"
    | "file"
    | "date";

type FormBlockInteractionSettings = {
    rows?: number;
    max_chars?: number;
    minDate?: string;
    maxDate?: string;
    noPastDates?: boolean;
    required?: boolean;
    start?: number;
    end?: number;
    icon?: string;
    color?: string;
    labelLeft?: string;
    labelRight?: string;
    decimalPlaces?: number;
    useSymbol?: string;
    allowedFiles?: number;
    allowedFileSize?: number;
    allowedFileTypes?: Record<string, boolean>;
};

interface FormBlockInteractionModel extends BaseModel {
    type: FormBlockInteractionType;
    name: string | null;
    is_editable: boolean | null;
    is_disabled: boolean | null;
    label: string | null;
    options: FormBlockInteractionSettings;
    message: string | null;
    form_block_id: number;
    deleted_at: string | null;
}

type InteractionOption = {
    id?: number;
    label: string;
    value: FormBlockType;
    icon?: string;
};

type PublicFormBlockInteractionModel = {
    id: string;
    type: FormBlockInteractionType;
    options: FormBlockInteractionSettings;
    label: string | null;
    message: string | null;
    name: string | null;
    is_editable: boolean | null;
    is_disabled: boolean | null;
};

type PublicFormBlockModel = {
    id: string;
    message: string | null;
    title: string | null;
    type: FormBlockType;
    parent_block: string | null;
    is_required: boolean | null;
    interactions: Array<PublicFormBlockInteractionModel>;
    logics: Array<FormBlockLogic> | undefined;
};

type PublicFormModel = {
    uuid: string;
    name: string;
    description: string | null;
    language: string | null;
    avatar: string | null;
    background: string | null;
    preview_image_path: string | null;
    brand_color: string | null;
    background_color: string | null;
    text_color: string | null;
    contrast_color: string | null;
    interaction_text_color: string | null;
    interaction_background_color: string | null;
    user_message_text_color: string | null;
    user_message_background_color: string | null;
    user_message_text_color: string | null;
    user_message_background_color: string | null;
    use_brighter_inputs: boolean | null;
    show_form_progress: boolean | null;
    eoc_text: string | null;
    eoc_headline: string | null;
    data_retention_days: number | null;
    legal_notice_link: string | null;
    privacy_link: string | null;
    cta_label: string | null;
    cta_link: string | null;
    cta_append_params: boolean;
    cta_append_session_id: boolean;
    use_cta_redirect: boolean;
    linkedin: string | null;
    github: string | null;
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    show_cta_link: boolean;
    show_social_links: boolean;
    show_form_progress: boolean;
    is_published: boolean;
};

type FormStoryboard = {
    count: integer;
    blocks: Array<PublicFormBlockModel>;
};

type FormSessionModel = {
    id: number;
    token: string;
    params?: Record<string, any>;
    is_completed: boolean;
    has_data_privacy: boolean;
    created_at: string;
    responses?: Record<string, any>;
    webhooks?: Array<FormSessionWebhookModel>;
};

type FormSessionWebhookModel = {
    id: number;
    name: string;
    response?: string;
    status?: number;
    tries: number;
    updated_at: string;
};

type FormSubmitPayload = Record<
    string,
    | FormBlockInteractionPayload
    | FormBlockInteractionPayload[]
    | FormBlockUploadPayload
>;

type FormFileUploads = Record<
    string,
    {
        total: number;
        loaded: number;
    }
>;

type FormBlockInteractionPayload = {
    payload: any;
    actionId: string;
};

type FormBlockUploadPayload = {
    payload: File[];
    actionId: string;
};

type EmbedFlags = {
    hideTitle?: boolean;
    hideNavigation?: boolean;
    autofocus?: boolean;
    alignLeft?: boolean;
};

type ImageType = "avatar" | "background";

type FilterSetting = "published" | "unpublished" | "trashed" | null;
type SortSetting = "name:asc" | "created_at:desc" | "updated_at:desc";
