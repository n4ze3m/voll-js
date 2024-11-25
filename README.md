# Volljs

**WARNING**: This is a work in progress and is not ready for production use.

A simple, file-based HTTP framework using Bun as a runtime.

## Current Features

- File-based routing
- Built-in middleware support
- Schema validation using [Ajv](https://ajv.js.org/)
- TypeScript support


# Installation

```bash
bun add volljs
```

### Quick Start

*Project Structure*


```
your-project/
├── routes/
│   ├── index.ts         # GET /
│   ├── users/
│   │   ├── index.ts     # GET /users
│   │   ├── [id].ts      # GET /users/:id
│   │   └── create.ts    # POST /users/create
│   └── posts/
│       └── [slug].ts    # GET /posts/:slug
├── package.json
└── index.ts
```

### Basic Usage

Create your entry file `index.ts`:

```ts
import { Voll } from 'volljs'

const app = new Voll({
  routesDir: 'routes',
  showRoutes: true
})

app.listen(3000)
```

Next, create a route file `routes/index.ts`:


```ts
import { VollRequest, VollResponse } from 'volljs'

export const GET = (req: VollRequest, res: VollResponse) => {
  return res.sendJson({ message: 'Welcome to Voll!' })
}
```


Create a dynamic route `routes/users/[id].ts`:


```ts
import { VollRequest, VollResponse } from 'volljs'

export const GET = (req: VollRequest, res: VollResponse) => {
  const { id } = req.params
  return res.sendJson({ userId: id })
}

// Add schema validation
export const config = {
  GET: {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }
}
```

### Start the server

```bash
bun run index.ts
``` 

Visit http://localhost:3000 to see your API in action!