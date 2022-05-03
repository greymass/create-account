import { NameType } from '@greymass/eosio'
import type { CallbackPayload, ChainIdType } from 'eosio-signing-request'

export interface AccountCreationOptions {
    scope: NameType
    supportedChains?: ChainIdType[]
    whalesplainerUrl?: string
    returnUrl?: string
}

export type AccountCreationResponse = CallbackPayload
