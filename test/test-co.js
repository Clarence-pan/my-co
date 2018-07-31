
const assert = require('power-assert')
const co = require('..')

describe('Test co()', function(){
    it('Simple generator should be ok', async function(){
        let a, b
        const res = await co(function*(){
            a = yield 1
            b = yield 2
            return 3
        })

        assert(a === 1)
        assert(b === 2)
        assert(res === 3)
    })

    it('Thrown errors should be rejected', async function(){
        await co(function*(){
            throw new Error('1')
        }).then(
            v => {
                assert(false, 'It should NOT goes here')
            },
            e => {
                assert(e && e.message === '1')
            }
        )
    })

    it('Thrown errors should be rejected even after yield', async function(){
        let a, b
        await co(function*(){
            a = yield 1
            throw new Error('2')
            b = 3
        }).then(
            v => {
                assert(false, 'It should NOT goes here')
            },
            e => {
                assert(e && e.message === '2')
            }
        )

        assert(a === 1)
        assert(b === undefined)
    })

    it('Resolved Promise should be expanded', async function(){
        let a, b
        const res = await co(function*(){
            a = yield Promise.resolve(1)
            b = yield 2
            return 3
        })

        assert(a === 1)
        assert(b === 2)
        assert(res === 3)
    })

    it('Rejected Promise should be thrown inside generator', async function(){
        let a, b
        const res = await co(function*(){
            a = 1
            
            try {
                a = yield Promise.reject(new Error('2'))
            } catch (e){
                b = +e.message
            }

            return 3
        })

        assert(a === 1)
        assert(b === 2)
        assert(res === 3)
    })

    it('Rejected Promise should be thrown if uncaught', async function(){
        let a, b, c
        const res = await co(function*(){
            a = 1
            b = yield Promise.reject(new Error('2'))
            c = 3
        }).then(
            v => {
                assert(false, 'It should NOT goes here')
            },
            e => {
                assert(e && e.message === '2')
            }
        )

        assert(a === 1)
        assert(b === undefined)
        assert(c === undefined)
        assert(res === undefined)
    })

})
