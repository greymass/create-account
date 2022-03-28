/**
 * Protocol for the account creation request.
 * `anchorcreate:<base64u_payload>`
 * First byte of payload is version, remainder is ABIencoded CreateRequest.
 */

import { Bytes, Name, Serializer, Struct } from '@greymass/eosio'
import { Base64u } from 'eosio-signing-request'

export type CreateRequestType =
    | string
    | {
          code: string
          login_url?: string
          return_url?: string
          scope?: string
      }

@Struct.type('create_payload')
export class CreateRequest extends Struct {
    static version = 1

    @Struct.field('string') declare code: string
    @Struct.field('string?') declare login_url?: string
    @Struct.field('string$') declare return_url?: string
    @Struct.field('name$') declare scope?: Name

    static from(value: CreateRequestType): CreateRequest {
        if (typeof value === 'string') {
            return this.fromString(value)
        } else {
            return super.from(value) as CreateRequest
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
}
