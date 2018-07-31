const isPromiseLike = require('./is-promise-like')


module.exports = function co(gen) {
    return new Promise((resolve, reject) => {
        try {
            const generator = gen()
            
            const execute = (generator, value) => {
                let x
                try {
                    x = generator.next(value)
                } catch (e){
                    reject(e)
                }

                if (x.done) {
                    resolve(x.value)
                    return
                }

                const nextValue = x.value
                if (isPromiseLike(nextValue)) {
                    nextValue.then(
                        v => execute(generator, v),
                        e => {
                            try {
                                const t = generator.throw(e) // 出错了，在 gen 内部抛出异常
                                if (t.done){
                                    resolve(t.value)
                                } else {
                                    execute(generator, t.value) // 处理被 catch 的情况
                                }
                            } catch (e) {
                                reject(e)
                            }
                        }
                    )
                } else {
                    execute(generator, nextValue)
                }
            }

            execute(generator)
        } catch (e) {
            reject(e)
        }
    })
}

