import { describe, expect, it } from 'bun:test'
import { matchRoute } from '../src/utils/match-route'

describe('matchRoute', () => {
    it('matches exact static routes', () => {
        expect(matchRoute('/users/profile', '/users/profile')).toEqual({})
    })

    it('matches routes with single parameter', () => {
        expect(matchRoute('/users/123', '/users/:id')).toEqual({ id: '123' })
    })

    it('matches routes with multiple parameters', () => {
        expect(matchRoute('/org/repo/branch', '/:org/:repo/:branch')).toEqual({
            org: 'org',
            repo: 'repo',
            branch: 'branch'
        })
    })

    it('matches catch-all routes', () => {
        expect(matchRoute('/docs/a/b/c', '/docs/rest*')).toEqual({
            rest: ['a', 'b', 'c']
        })
    })

    it('matches routes with parameters and catch-all', () => {
        expect(matchRoute('/users/123/posts/a/b/c', '/users/:id/posts/rest*')).toEqual({
            id: '123',
            rest: ['a', 'b', 'c']
        })
    })

    it('returns null for non-matching static segments', () => {
        expect(matchRoute('/users/profile', '/users/settings')).toBeNull()
    })

    it('returns null for different segment lengths', () => {
        expect(matchRoute('/users/123/extra', '/users/:id')).toBeNull()
    })

    it('returns null when catch-all base path does not match', () => {
        expect(matchRoute('/different/a/b/c', '/docs/rest*')).toBeNull()
    })

    it('returns null when catch-all path is shorter than base path', () => {
        expect(matchRoute('/docs', '/docs/rest*')).toBeNull()
    })

    it('handles empty catch-all segments', () => {
        expect(matchRoute('/docs/', '/docs/rest*')).toEqual({
            rest: ['']
        })
    })

    it('matches routes with mixed static and dynamic segments', () => {
        expect(matchRoute('/api/v1/users/123', '/api/v1/users/:id')).toEqual({
            id: '123'
        })
    })
})
