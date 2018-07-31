const isPromiseLike = require('./is-promise-like')

module.exports = function co(gen) {
    return new Promise((resolve, reject) => {
        try {
            const generator = gen()

            const execute = (generator, value) => {
                const x = generator.next(value)
                if (x.done) {
                    resolve(x.value)
                    return
                }

                const nextValue = x.value
                if (isPromiseLike(nextValue)) {
                    nextValue.then(
                        v => execute(generator, v),
                        e => {
                            const t = generator.throw(e) // 出错了，在generator内部抛出异常
                            if (t.done){
                                resolve(t.value)
                            } else {
                                execute(generator, t.value) // 处理被catch的情况
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

