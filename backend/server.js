import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import fs from "fs";
import path from "path";

// Leemos el archivo de forma sincrónica al arrancar el servidor
const typeDefs = fs.readFileSync(
  path.join(process.cwd(), "./backend/lib/types/graphql_definitions.graphql"),
  "utf-8",
);

// 2. Configura el driver de Neo4j
const driver = neo4j.driver(
  "neo4j://127.0.0.1:7687", // Tu URI
  neo4j.auth.basic("neo4j", "lilium89"),
);

// 3. Crea la instancia de la librería de Neo4j para GraphQL
const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

// 4. Inicia el servidor
const server = new ApolloServer({
  schema: await neoSchema.getSchema(),
  context: ({ req }) => ({
    driver: driver.session({ database: req.headers["graphql"] || "neo4j" }),
  }),
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Servidor GraphQL listo en: ${url}`);
console.log(`📡 Accesible desde el frontend en: http://localhost:4000/graphql`);
