import { Name } from '@greymass/eosio'
import { ChainId } from 'eosio-signing-request'
import { detectReturnPath } from '@greymass/return-path'

import { AccountCreationOptions, AccountCreationResponse } from './types'

export class AccountCreator {
    private popupWindow?: Window
    private scope?: Name
    private supportedChains: ChainId[]
    private creationServiceUrl: string
    private returnUrl: string
    private popupStatusInterval?: ReturnType<typeof setInterval>

    constructor(public readonly options: AccountCreationOptions) {
        this.supportedChains = (options.supportedChains || []).map((id) => ChainId.from(id))
        if (options.scope) {
            this.scope = Name.from(options.scope)
        }
        this.creationServiceUrl = options.creationServiceUrl || 'https://create.anchor.link'
        this.returnUrl = options.returnUrl || detectReturnPath()
    }

    async createAccount(): Promise<AccountCreationResponse> {
        const qs = new URLSearchParams()
        qs.set('return_url', this.returnUrl)
        if (this.supportedChains.length > 0) {
            qs.set('supported_chains', this.supportedChains.map(String).join(','))
        }
        if (this.scope) {
            qs.set('scope', String(this.scope))
        }
        const url = `${this.creationServiceUrl}/create?${qs}`
        this.popupWindow = window.open(
            url,
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

        return new Promise((resolve, reject) => {
            const listener = (event: MessageEvent) => {
                if (event.origin === this.creationServiceUrl) {
                    window.removeEventListener('message', listener)
                    this.closeDialog()

                    if (event.data.error) {
                        reject(new Error(event.data.error))
                    } else {
                        resolve(event.data)
                    }
                }
            }
            window.addEventListener('message', listener)

            this.popupStatusInterval = setInterval(() => {
                if (this.popupWindow && this.popupWindow.closed) {
                    this.closeDialog()

                    reject(new Error('Popup window closed'))
                }
            }, 500)
        })
    }

    closeDialog() {
        this.popupWindow?.close()

        this.cleanup()
    }

    cleanup() {
        this.popupStatusInterval && clearInterval(this.popupStatusInterval)
        this.popupStatusInterval = undefined
        this.popupWindow = undefined
    }
}
