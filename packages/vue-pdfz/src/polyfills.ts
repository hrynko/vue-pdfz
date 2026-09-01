import { isClient } from './utils'

export function ensureReadableStreamAsyncIterator(): void {
  if (!isClient || typeof ReadableStream === 'undefined') {
    return
  }
  const proto = ReadableStream.prototype as {
    [Symbol.asyncIterator]?: () => AsyncIterator<unknown>
    getReader(): ReadableStreamDefaultReader<unknown>
  }
  if (proto[Symbol.asyncIterator]) {
    return
  }
  proto[Symbol.asyncIterator] = function (this: ReadableStream): AsyncIterator<unknown> {
    const reader = this.getReader()
    return {
      next: () => reader.read() as Promise<IteratorResult<unknown>>,
      return(value?: unknown): Promise<IteratorResult<unknown>> {
        reader.releaseLock()
        return Promise.resolve({ done: true, value })
      },
    }
  }
}
