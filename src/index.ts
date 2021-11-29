/**
 * Solve for completeness.
 * @param n The number.
 * @param p The problem.
 * @param hard Set to true for super hard problem.
 * @returns The solution.
 */

import {NameType} from '@greymass/eosio'

import {IdentityProof} from "eosio-signing-request";

import {generateReturnUrl} from "./utils";

export interface AccountCreationOptions
{
    scope: NameType

    supportedChains?: Record<string, string>

    loginOnCreate?: boolean

    returnUrl?: string
}

interface CreateAccountResponse {
    actor?: NameType;

    network?: string;

    identityProof?: IdentityProof;

    error?: string;
}

const accountCreationUrl = 'http://192.168.1.68:3000' //'https://create.anchor.link'

export class AccountCreator {
    /** Package version. */
    static version = '__ver' // replaced by build script

    private popupWindow?: Window

    private scope: NameType
    private supportedChains?: Record<string, string>
    private loginOnCreate?: boolean
    private returnUrl?: string

    constructor(public readonly options: AccountCreationOptions) {
        this.supportedChains = options.supportedChains
        this.scope = options.scope
        this.loginOnCreate = options.loginOnCreate
        this.returnUrl = options.returnUrl || generateReturnUrl()
    }


    async createAccount() : Promise<CreateAccountResponse> {
        const supportedChains =
            this.supportedChains &&
            `supported_chains=${Object.keys(this.supportedChains).join(',')}`
        const popupWindowUrl = `${accountCreationUrl}/activate/ASRlZWY0ODg5ZS0yMTRlLTRkZGItYTkxNS02YzE0YWU2ZjNhM2UA?${`supported_chains=${
            supportedChains || ''
        }`}${`&scope=${this.scope}`}${`&return_url=${this.returnUrl || ''}`}${
            this.loginOnCreate ? '&login_on_create=true' : ''
        }`

        this.popupWindow = window.open(
            popupWindowUrl,
            'targetWindow',
            `toolbar=no,
            location=no,
            status=no,
            menubar=no,
            scrollbars=yes,
            resizable=yes,
            width=400,
            height=600`
        )!

        return new Promise((resolve) => {
            window.addEventListener(
                'message',
                (event) => {
                    if (event.data.status === 'success') {
                        resolve({
                            actor: event.data.actor,
                            network: event.data.network,
                            identityProof: event.data.identity_proof,
                        })
                    } else {
                        resolve({
                            error:
                                event.data.error ||
                                'An error occurred during the account creation process.',
                        })
                    }

                    this.popupWindow?.close()
                },
                false
            )
        })
    }

    closeDialog() {
        this.popupWindow?.close()
    }
}
