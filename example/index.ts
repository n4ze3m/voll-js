import { Voll } from "../packages/volljs/src"
const app = new Voll({
    routesDir: "routes",
    showRoutes: false
})


app.listen(3000)