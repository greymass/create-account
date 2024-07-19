import { NameType } from '@wharfkit/antelope'
import type { CallbackPayload, ChainIdType } from '@wharfkit/signing-request'

export interface AccountCreationOptions {
    scope: NameType
    supportedChains?: ChainIdType[]
    creationServiceUrl?: string
    fullCreationServiceUrl?: string
    returnUrl?: string
}

export interface AccountCreationErrorResponse {
    error: string
}

export type AccountCreationResponse = CallbackPayload | AccountCreationErrorResponse
