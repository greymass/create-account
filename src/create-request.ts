/**
 * Protocol for the account creation request.
 * `anchorcreate:<base64u_payload>`
 * First byte of payload is version, remainder is ABIencoded CreateRequest.
 */

import {
    ABISerializable,
    ABISerializableConstructor,
    ABISerializableType,
    Bytes,
    isInstanceOf,
    Name,
    NameType,
    Serializer,
    Struct,
    VarUInt,
} from '@greymass/eosio'
import { Base64u, SigningRequest } from 'eosio-signing-request'

export type CreateRequestArguments = {
    code: string
    login_url?: string
    login_scope?: NameType
    return_path?: string
}
export type CreateRequestType = CreateRequest | string | CreateRequestArguments

enum CreateInfoKey {
    login_scope = 1,
    return_path = 2,
}

@Struct.type('create_request_info')
class CreateRequestInfo extends Struct {
    @Struct.field('varuint32') declare key: VarUInt
    @Struct.field('bytes') declare data: Bytes
}

@Struct.type('create_request')
export class CreateRequest extends Struct {
    static version = 1

    /** The sextant account creation code. */
    @Struct.field('string') declare code: string
    /** Optional URL to post a ESR callback payload with a id proof after the account has been created. */
    @Struct.field('string?') declare login_url?: string

    /** Extra metadata attached to the request. */
    @Struct.field(CreateRequestInfo, { array: true, extension: true })
    declare info: CreateRequestInfo[]

    static from(value: CreateRequestType): CreateRequest {
        if (typeof value === 'string') {
            return this.fromString(value)
        } else {
            const rv = super.from(value) as CreateRequest
            if (value.login_scope) {
                rv.login_scope = value.login_scope
            }
            if (value.return_path) {
                rv.return_path = value.return_path
            }
            return rv
        }
    }

    static fromString(value: string): CreateRequest {
        if (value.slice(0, 13) === 'anchorcreate:') {
            value = value.slice(13)
        }
        if (value.slice(0, 2) === '//') {
            value = value.slice(2)
        }
        const data = Base64u.decode(value)
        const version = data[0]
        if (version !== CreateRequest.version) {
            throw new Error(`Unsupported create request version: ${version}`)
        }
        return Serializer.decode({ type: CreateRequest, data: data.slice(1) })
    }

    /** Login scope, only valid if login_url is set. */
    get login_scope(): Name {
        return this.getInfo(CreateInfoKey.login_scope, Name) || Name.from('')
    }
    set login_scope(value: NameType) {
        this.setInfo(CreateInfoKey.login_scope, Name.from(value))
    }

    /** Return path, where Anchor should redirect once done, use only for same-device requests. */
    get return_path(): string {
        return this.getInfo(CreateInfoKey.return_path) || ''
    }
    set return_path(value: string) {
        if (value) {
            this.setInfo(CreateInfoKey.return_path, value)
        } else {
            this.removeInfo(CreateInfoKey.return_path)
        }
    }

    /** ESR to sign once account has been created. */
    get loginRequest(): SigningRequest | null {
        if (!this.login_url) {
            return null
        }
        return SigningRequest.createSync({
            identity: { scope: this.login_scope },
            chainId: null,
            callback: { url: this.login_url, background: true },
            info: {
                return_path: this.return_path,
            },
        })
    }

    encode() {
        const data = Serializer.encode({ object: this })
        return Bytes.from([CreateRequest.version]).appending(data)
    }

    toString(includeProtocol?: boolean) {
        let rv = Base64u.encode(this.encode().array)
        if (includeProtocol !== false) {
            rv = `anchorcreate://${rv}`
        }
        return rv
    }

    private setInfo(key: CreateInfoKey, value: ABISerializable, type?: ABISerializableType) {
        let data: Bytes
        if (typeof value === 'string' && !type) {
            data = Bytes.from(value, 'utf8')
        } else if (isInstanceOf(value, Bytes) && !type) {
            data = value
        } else {
            data = Serializer.encode({ object: value, type })
        }
        const existing = this.info.find((i) => Number(i.key) === key)
        if (existing) {
            existing.data = data
        } else {
            this.info.push(CreateRequestInfo.from({ key, data }))
        }
    }

    private getInfo(key: CreateInfoKey): string
    private getInfo<T extends ABISerializableConstructor>(
        key: CreateInfoKey,
        type: T
    ): InstanceType<T>
    private getInfo(key: CreateInfoKey, type: ABISerializableType): any
    private getInfo(key: CreateInfoKey, type?: ABISerializableType): any {
        const info = this.info?.find((info) => Number(info.key) === key)
        if (info) {
            if (type) {
                return Serializer.decode({ data: info.data, type })
            } else {
                return info.data.utf8String
            }
        }
    }

    private removeInfo(key: CreateInfoKey) {
        this.info = this.info.filter((info) => Number(info.key) !== key)
    }
}
