export interface GenericDto<T = unknown> {
    apiVersion?: string
    data: T
}