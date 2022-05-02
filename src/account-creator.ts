import { Name } from '@greymass/eosio'
import { ChainId } from 'eosio-signing-request'

import { generateReturnUrl } from './utils'
import { AccountCreationOptions, AccountCreationResponse } from './types'

export class AccountCreator {
    private popupWindow?: Window
    private scope?: Name
    private supportedChains: ChainId[]
    private whalesplainerUrl: string
    private returnUrl: string
    private popupStatusInterval?: ReturnType<typeof setInterval>

    constructor(public readonly options: AccountCreationOptions) {
        this.supportedChains = (options.supportedChains || []).map((id) => ChainId.from(id))
        if (options.scope) {
            this.scope = Name.from(options.scope)
        }
        this.whalesplainerUrl = options.whalesplainerUrl || 'https://create.anchor.link'
        this.returnUrl = options.returnUrl || generateReturnUrl()
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
        const url = `${this.whalesplainerUrl}/create?${qs}`
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
                window.removeEventListener('message', listener)
                this.closeDialog()

                if (event.data.error) {
                    reject(event.data)
                } else {
                    resolve(event.data)
                }
            }
            window.addEventListener('message', listener)

            this.popupStatusInterval = setInterval(() => {
                if (this.popupWindow && this.popupWindow.closed) {
                    this.closeDialog()

                    reject({ error: 'Popup window closed' })
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
