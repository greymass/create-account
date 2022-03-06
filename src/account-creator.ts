import {NameType} from '@greymass/eosio'

import {generateReturnUrl} from './utils'

import {AccountCreationOptions, AccountCreationResponse} from './types'

const accountCreationUrl = 'https://create.anchor.link'

export class AccountCreator {
    /** Package version. */
    static version = '__ver' // replaced by build script

    private popupWindow?: Window

    private scope: NameType
    private supportedChains?: Record<string, string>
    private whalesplainerUrl?: string
    private loginOnCreate?: boolean
    private returnUrl?: string

    constructor(public readonly options: AccountCreationOptions) {
        this.supportedChains = options.supportedChains
        this.scope = options.scope
        this.whalesplainerUrl = options.whalesplainerUrl || accountCreationUrl
        this.returnUrl = options.returnUrl || generateReturnUrl()
    }

    async createAccount(): Promise<AccountCreationResponse> {
        const supportedChains =
            this.supportedChains &&
            `supported_chains=${Object.keys(this.supportedChains).join(',')}`
        const popupWindowUrl = `${this.whalesplainerUrl}/create?${`supported_chains=${
            supportedChains || ''
        }`}${`&scope=${this.scope}`}${`&return_url=${this.returnUrl || ''}`}${
            this.loginOnCreate ? '&login_on_create=true' : ''
        }`

        console.log({popupWindowUrl})

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
