import Fastify from "fastify";

const fastify = Fastify({ logger: true });

fastify.get("/ping", async (request, reply) => {
	return { pong: "it works!" };
});

const start = async () => {
	try {
		await fastify.listen({ port: 3001, host: "0.0.0.0" });
		console.log("Fastify server running!");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
