import { assert } from 'chai'

import { PermissionLevel } from '@greymass/eosio'

import type { AccountCreationResponse } from '../src/types'

import * as lib from '$lib'

suite('create request', function () {
    test('encode', function () {
        const req = lib.CreateRequest.from({
            code: 'testcode123',
        })
        assert.equal(String(req), 'anchorcreate://AQt0ZXN0Y29kZTEyMwAA')
    })
    test('decode', function () {
        const req = lib.CreateRequest.from('anchorcreate://AQt0ZXN0Y29kZTEyMwAA')
        assert.equal(req.code, 'testcode123')
    })

    test('metadata', function () {
        const req1 = lib.CreateRequest.from({
            code: '666666',
            return_path: 'foobar://ye',
            login_url: 'https://foo.bar',
            login_scope: 'baz',
        })
        const req2 = lib.CreateRequest.from(req1.toString())
        assert.equal(req2.return_path, 'foobar://ye')
        assert.equal(req2.login_url, 'https://foo.bar')
        assert.equal(String(req2.login_scope), 'baz')

        const loginReq = req2.loginRequest!
        assert.exists(loginReq)
        assert.isTrue(loginReq.isIdentity())
        const resolved = loginReq.resolve(new Map(), PermissionLevel.from('foo@active'), {
            chainId: 'beeffacebeeffacebeeffacebeeffacebeeffacebeeffacebeeffacebeefface',
        })
        const sig =
            'SIG_K1_Jw6YDQGFoL5zYCXwL1NZxfhNFw8t3gASPKoNvpvBPxyUbduL4SGxYuSuQDQciTNUWYVMMHZZafbS4i3rjsGggbA3FnSNGB'
        const callback = resolved.getCallback([sig])!
        assert.exists(callback)
        assert.equal(callback.url, 'https://foo.bar')
        assert.isTrue(callback.background)
        const proof = resolved.getIdentityProof(sig)
        assert.equal(String(proof.scope), 'baz')
        const returnPath = loginReq.getInfoKey('return_path')
        assert.equal(returnPath, 'foobar://ye')
    })
})
