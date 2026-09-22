import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  clamp,
  debounce,
  limitCanvasScale,
  normalizePdfError,
  normalizeSource,
  parsePdfDate,
  round,
} from '../src/utils'

describe('utils', () => {
  describe('clamp', () => {
    it('clamps numbers', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-1, 0, 10)).toBe(0)
      expect(clamp(11, 0, 10)).toBe(10)
    })
  })

  describe('debounce', () => {
    it('invokes once after the wait window', async () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const fnDebounced = debounce(fn, 100)
      fnDebounced()
      fnDebounced()
      fnDebounced()
      expect(fn).not.toHaveBeenCalled()
      vi.advanceTimersByTime(120)
      expect(fn).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })

    it('can be cancelled', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const fnDebounced = debounce(fn, 100)
      fnDebounced()
      fnDebounced.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('limitCanvasScale', () => {
    const ZOOMED = { width: 612 * 10, height: 792 * 10 }
    const canvasPixels = (scale: number): number =>
      ZOOMED.width * ZOOMED.height * (devicePixelRatio * scale) ** 2
    const stubDisplay = (availWidth: number, availHeight: number, dpr: number): void => {
      vi.stubGlobal('screen', { availWidth, availHeight })
      vi.stubGlobal('devicePixelRatio', dpr)
    }

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('keeps full resolution at normal zoom', () => {
      stubDisplay(1512, 982, 2)
      expect(limitCanvasScale(612, 792)).toBe(1)
    })

    it('caps the canvas at 3x the screen area', () => {
      stubDisplay(1512, 982, 2)
      const scale = limitCanvasScale(ZOOMED.width, ZOOMED.height)
      expect(canvasPixels(scale)).toBeCloseTo(17_817_408)
    })

    it('caps each canvas side at 32767px', () => {
      stubDisplay(5120, 2880, 1)
      expect(40_000 * limitCanvasScale(100, 40_000)).toBeCloseTo(32_767)
    })

    it('uses the lower mobile cap on iPadOS', async () => {
      vi.stubGlobal('navigator', {
        maxTouchPoints: 5,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      })
      vi.resetModules()
      const utils = await import('../src/utils')
      stubDisplay(1366, 1024, 2)
      const scale = utils.limitCanvasScale(ZOOMED.width, ZOOMED.height)
      expect(canvasPixels(scale)).toBeCloseTo(5 * 2 ** 20)
    })
  })

  describe('normalizePdfError', () => {
    it('maps known pdf.js exception names to codes', () => {
      expect(normalizePdfError({ name: 'InvalidPDFException' }).code).toBe('INVALID_PDF')
      expect(normalizePdfError({ name: 'MissingPDFException' }).code).toBe('MISSING_PDF')
      expect(normalizePdfError({ name: 'PasswordException' }).code).toBe('PASSWORD_REQUIRED')
      expect(normalizePdfError({ name: 'UnexpectedResponseException' }).code).toBe('NETWORK_ERROR')
      expect(normalizePdfError({ name: 'UnknownErrorException' }).code).toBe('UNKNOWN')
    })

    it('infers worker/network errors from the message', () => {
      expect(normalizePdfError({ message: 'Worker failed to load' }).code).toBe('WORKER_ERROR')
      expect(normalizePdfError({ message: 'network fetch failed' }).code).toBe('NETWORK_ERROR')
    })

    it('falls back to UNKNOWN', () => {
      expect(normalizePdfError({ message: 'foo' }).code).toBe('UNKNOWN')
    })
  })

  describe('normalizeSource', () => {
    it('returns null for empty input', () => {
      expect(normalizeSource(null)).toBeNull()
      expect(normalizeSource('')).toBeNull()
    })

    it('wraps a string url', () => {
      expect(normalizeSource('a.pdf')).toEqual({ url: 'a.pdf' })
    })

    it('wraps a URL instance', () => {
      expect(normalizeSource(new URL('https://localhost/a.pdf'))).toEqual({
        url: 'https://localhost/a.pdf',
      })
    })

    it('wraps binary inputs as data', () => {
      const bytes = new Uint8Array([1, 2, 3])
      expect(normalizeSource(bytes)).toEqual({ data: bytes })
      const buffer = normalizeSource(bytes.buffer) as { data: Uint8Array }
      expect(buffer.data).toBeInstanceOf(Uint8Array)
    })

    it('maps config objects and applies password override', () => {
      expect(
        normalizeSource(
          { url: 'a.pdf', withCredentials: true, httpHeaders: { A: '1' } },
          { password: 'secret' },
        ),
      ).toMatchObject({
        url: 'a.pdf',
        withCredentials: true,
        httpHeaders: { A: '1' },
        password: 'secret',
      })
    })
  })

  describe('parsePdfDate', () => {
    it('parses PDF date strings', () => {
      const date = parsePdfDate('D:20240115120000')
      expect(date?.getFullYear()).toBe(2024)
      expect(date?.getMonth()).toBe(0)
      expect(date?.getDate()).toBe(15)
    })

    it('returns null for invalid input', () => {
      expect(parsePdfDate(undefined)).toBeNull()
      expect(parsePdfDate('foo')).toBeNull()
    })
  })

  describe('round', () => {
    it('rounds to decimals', () => {
      expect(round(1.23456, 2)).toBe(1.23)
      expect(round(1.005, 2)).toBe(1)
    })
  })
})
