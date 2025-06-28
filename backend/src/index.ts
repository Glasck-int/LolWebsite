import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";

const app = fastify();

// Serve static files
app.register(fastifyStatic, {
	root: path.join(__dirname, "../../public"),
	prefix: "/static/",
});

// CORS pour toute l'équipe
app.register(require("@fastify/cors"), {
	origin: ["http://localhost:3000"],
	credentials: true,
});

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = "0.0.0.0"; // Important : écoute sur toutes les interfaces

app.listen({ port: PORT, host: HOST });
