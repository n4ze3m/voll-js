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

    it('handles hyphenated dynamic parameters in filename', () => {
        expect(buildRoutePath('blog', '[id]-[post].ts')).toBe('/blog/:id-:post')
    })
    it('handles multiple nested dynamic and catch-all parameters', () => {
        expect(buildRoutePath('users/[id]/posts/[postId]/comments/[...commentId]', 'details.ts'))
            .toBe('/users/:id/posts/:postId/comments/commentId*/details')
    })

    it('handles parameters with underscores and hyphens', () => {
        expect(buildRoutePath('api', '[user_id]-[session-id].ts'))
            .toBe('/api/:user_id-:session-id')
    })

    it('handles files with multiple extensions', () => {
        expect(buildRoutePath('scripts', 'build.module.test.ts')).toBe('/scripts/build.module.test')
    })

    it('handles paths with uppercase letters', () => {
        expect(buildRoutePath('Admin/Users', 'Profile.ts')).toBe('/Admin/Users/Profile')
    })

    it('handles special characters in filenames', () => {
        expect(buildRoutePath('path', '[email@domain].ts')).toBe('/path/:email@domain')
    })

    it('handles absolute paths', () => {
        expect(buildRoutePath('/var/www', 'index.ts')).toBe('/var/www')
    })

    it('handles query parameters in filenames', () => {
        expect(buildRoutePath('search', '[query].ts')).toBe('/search/:query')
    })

    it('handles multiple dynamic parameters separated by special characters', () => {
        expect(buildRoutePath('reports', '[year].[month].[day].ts'))
            .toBe('/reports/:year.:month.:day')
    })

    it('handles complex nested parameters with dots', () => {
        expect(buildRoutePath('plantae', '[genus].[species].ts'))
            .toBe('/plantae/:genus.:species')
    })

    it('handles complex route patterns with multiple segments', () => {
        expect(buildRoutePath('user', '[firstName]-[lastName].ts'))
            .toBe('/user/:firstName-:lastName')

        expect(buildRoutePath('files', '[name].[year].[ext].ts'))
            .toBe('/files/:name.:year.:ext')

        expect(buildRoutePath('posts', '[category]-[type].[year].[status].ts'))
            .toBe('/posts/:category-:type.:year.:status')
    })

    it('handles flight route patterns', () => {
        expect(buildRoutePath('flights', '[from]-[to].ts'))
            .toBe('/flights/:from-:to')
    })

    it('handles taxonomic classification routes', () => {
        expect(buildRoutePath('species', '[kingdom].[phylum].[class].[order].ts'))
            .toBe('/species/:kingdom.:phylum.:class.:order')
    })

})
