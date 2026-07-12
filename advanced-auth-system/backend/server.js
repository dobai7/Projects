import "dotenv/config"
import app from "./src/app.js"
import connectToDB from "./src/config/database.js";
import dns from "dns"

dns.setServers(["1.1.1.1","0.0.0.0"])

connectToDB().then(() => {
    app.listen(3000, () => {
        console.log("server is running");
    })
})
