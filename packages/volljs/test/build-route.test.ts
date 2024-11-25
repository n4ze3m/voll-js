import { describe, expect, it } from 'bun:test'
import { buildRoutePath } from '../src/utils/build-route'

describe('buildRoutePath', () => {
    it('returns root path for index file with no current path', () => {
        expect(buildRoutePath('', 'index.ts')).toBe('/')
    })

    it('returns current path for index file with existing path', () => {
        expect(buildRoutePath('users', 'index.ts')).toBe('/users')
    })

    it('handles dynamic route parameters', () => {
        expect(buildRoutePath('users', '[id].ts')).toBe('/users/:id')
    })

    it('handles catch-all route parameters', () => {
        expect(buildRoutePath('docs', '[...slug].ts')).toBe('/docs/slug*')
    })

    it('handles nested dynamic and catch-all parameters', () => {
        expect(buildRoutePath('users/[id]/posts/[...slug]', 'comments.ts'))
            .toBe('/users/:id/posts/slug*/comments')
    })

    it('normalizes multiple forward slashes', () => {
        expect(buildRoutePath('//users//', 'profile.ts')).toBe('/users/profile')
    })

    it('converts backslashes to forward slashes', () => {
        expect(buildRoutePath('users\\posts', 'comments.ts')).toBe('/users/posts/comments')
    })

    it('handles empty current path with non-index file', () => {
        expect(buildRoutePath('', 'profile.ts')).toBe('/profile')
    })

    it('handles multiple dynamic parameters in path', () => {
        expect(buildRoutePath('[org]/[repo]', '[branch].ts'))
            .toBe('/:org/:repo/:branch')
    })

    it('handles file extensions correctly', () => {
        expect(buildRoutePath('api', 'users.js')).toBe('/api/users')
        expect(buildRoutePath('api', 'users.tsx')).toBe('/api/users')
        expect(buildRoutePath('api', 'users.jsx')).toBe('/api/users')
    })
})
