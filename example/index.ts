import { Voll } from "../packages/volljs/src"
const app = new Voll({
    routesDir: "routes",
    showRoutes: true
})


app.listen(3000)