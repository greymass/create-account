import { NameType } from '@greymass/eosio'
import { IdentityProof } from 'eosio-signing-request'

export interface AccountCreationOptions {
    scope: NameType

    supportedChains?: Record<string, string>

    whalesplainerUrl?: string

    returnUrl?: string
}

export interface AccountCreationResponse {
    actor?: NameType

    network?: string

    identityProof?: IdentityProof

    error?: string
}
