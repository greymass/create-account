import { NameType } from '@greymass/eosio'
import { ChainIdType, IdentityProof } from 'eosio-signing-request'

export interface AccountCreationOptions {
    scope: NameType
    supportedChains?: ChainIdType[]
    whalesplainerUrl?: string
    returnUrl?: string
}

export interface AccountCreationSuccessResponse {
    actor: NameType
    network: string
    identityProof: IdentityProof
}

export interface AccountCreationErrorResponse {
    error: string
}

export type AccountCreationResponse = AccountCreationSuccessResponse | AccountCreationErrorResponse
