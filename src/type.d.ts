interface Exception {
    message: string;
    code: string;
    status: number;
    reason: Record<string, unknown>;
    source: Array<'api-gateway'>;
}

interface httpArgument {
    params?: Record<string, any>;
    data?: Record<string, unknown>;
    headers?: Record<string, string | string[] | undefined>
}
