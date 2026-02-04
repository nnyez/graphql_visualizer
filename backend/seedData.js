import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  "neo4j://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "lilium89")
);

const session = driver.session({ database: "neo4j" });

const names = [
  "Juan", "María", "Carlos", "Ana", "David",
  "Elena", "Francisco", "Isabel", "Javier", "Laura",
  "Manuel", "Natalia", "Oscar", "Patricia", "Quentin",
  "Rosa", "Samuel", "Teresa", "Ulises", "Verónica",
  "Walter", "Ximena", "Yolanda", "Zacarías", "Adriana",
  "Benito", "Catalina", "Diego", "Emilia", "Fabio",
  "Gabriela", "Hector", "Iris", "Julio", "Karen",
  "Luis", "Margarita", "Nicolás", "Olga", "Pablo",
  "Querida", "Raúl", "Sandra", "Tomás", "Úrsula",
  "Víctor", "Wendy", "Xavier", "Yasmin", "Zoe"
];

const nicknames = [
  "Johnny", "Mary", "Charlie", "Annie", "Dave",
  "Lena", "Frank", "Isa", "Javi", "Lou",
  "Manu", "Nat", "Oscar", "Pati", "Q",
  "Ro", "Sam", "Tere", "Uli", "Vero",
  "Walt", "Xim", "Yo", "Zac", "Adri",
  "Beni", "Cat", "Diego", "Emi", "Fab",
  "Gaby", "Hec", "Iris", "Jul", "Kar",
  "Lui", "Marga", "Nico", "Olga", "Pablo",
  "Q", "Raul", "Sandy", "Tom", "Ursa",
  "Vic", "Wendy", "Xavier", "Yaz", "Zo"
];

const seedData = async () => {
  try {
    console.log("🌱 Iniciando ingreso de datos de prueba...\n");

    // Limpiar datos existentes
    console.log("🗑️  Limpiando datos existentes...");
    await session.run("MATCH (n) DETACH DELETE n");

    // Crear 10,000+ personas
    const PERSON_COUNT = 1000;
    console.log(`👥 Creando ${PERSON_COUNT} personas...`);
    
    const people = [];
    for (let i = 0; i < PERSON_COUNT; i++) {
      const firstNameIndex = i % names.length;
      const nicknameIndex = i % nicknames.length;
      people.push({
        id: `p${i + 1}`,
        name: `${names[firstNameIndex]} ${i + 1}`,
        nickname: `${nicknames[nicknameIndex]}_${i + 1}`,
        email: `user${i + 1}@example.com`,
        photoUrl: `https://i.pravatar.cc/150?img=${i % 70}`,
      });
    }

    // Crear nodos Person en lotes para mejor rendimiento
    const BATCH_SIZE = 500;
    for (let i = 0; i < people.length; i += BATCH_SIZE) {
      const batch = people.slice(i, i + BATCH_SIZE);
      const query = batch
        .map(
          (p, idx) =>
            `CREATE (p${idx}:Person {
              id: '${p.id}',
              name: '${p.name.replace(/'/g, "\\'")}',
              nickname: '${p.nickname.replace(/'/g, "\\'")}',
              email: '${p.email}',
              photoUrl: '${p.photoUrl}'
            })`
        )
        .join("\n");

      await session.run(query);
      console.log(
        `✅ Creadas ${Math.min(i + BATCH_SIZE, people.length)}/${people.length} personas`
      );
    }
    console.log(`✅ ${people.length} personas creadas\n`);

    // Crear relaciones bidireccionales (optimizado para escala)
    console.log("🔗 Creando relaciones bidireccionales...");
    const relationshipTypes = ["FRIEND", "FAMILY", "COLLEAGUE"];
    let relationshipCount = 0;

    // Crear relaciones por lotes
    const REL_BATCH_SIZE = 1000;
    let currentBatch = [];

    for (let i = 0; i < people.length; i++) {
      // Cada persona tendrá entre 1-3 relaciones
      const numRelations = Math.floor(Math.random() * 4) + 1;
      const connectedIndices = new Set();

      while (connectedIndices.size < numRelations) {
        const randomIndex = Math.floor(Math.random() * people.length);
        if (randomIndex !== i) {
          connectedIndices.add(randomIndex);
        }
      }

      for (const j of connectedIndices) {
        const status =
          relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
        const importance = Math.floor(Math.random() * 10) + 1;
        const frecuency = Math.floor(Math.random() * 10) + 1;

        // Relación bidireccional: A -> B y B -> A
        currentBatch.push({
          from: `p${i + 1}`,
          to: `p${j + 1}`,
          status,
          frecuency,
          importance,
        });

        currentBatch.push({
          from: `p${j + 1}`,
          to: `p${i + 1}`,
          status,
          frecuency,
          importance,
        });

        // Si alcanzamos el tamaño de lote, insertar y resetear
        if (currentBatch.length >= REL_BATCH_SIZE) {
          for (const rel of currentBatch) {
            await session.run(
              `MATCH (from:Person {id: $from})
              MATCH (to:Person {id: $to})
              MERGE (from)-[r:HAS_RELATIONSHIP {
                status: $status,
                frecuency: $frecuency,
                importance: $importance
              }]->(to)`,
              {
                from: rel.from,
                to: rel.to,
                status: rel.status,
                frecuency: rel.frecuency,
                importance: rel.importance,
              }
            );
          }
          relationshipCount += currentBatch.length;
          console.log(`✅ ${relationshipCount} relaciones creadas...`);
          currentBatch = [];
        }
      }
    }

    // Insertar relaciones restantes
    if (currentBatch.length > 0) {
      for (const rel of currentBatch) {
        await session.run(
          `MATCH (from:Person {id: $from})
          MATCH (to:Person {id: $to})
          MERGE (from)-[r:HAS_RELATIONSHIP {
            status: $status,
            frecuency: $frecuency,
            importance: $importance
          }]->(to)`,
          {
            from: rel.from,
            to: rel.to,
            status: rel.status,
            frecuency: rel.frecuency,
            importance: rel.importance,
          }
        );
      }
      relationshipCount += currentBatch.length;
    }

    console.log(`✅ ${relationshipCount} relaciones creadas (bidireccionales)\n`);

    // Verificar datos
    console.log("📊 Verificando datos ingresados...");
    const result = await session.run(`
      MATCH (p:Person)
      RETURN COUNT(p) as personCount
    `);
    const personCount = result.records[0].get("personCount");

    const relResult = await session.run(`
      MATCH ()-[r:HAS_RELATIONSHIP]->()
      RETURN COUNT(r) as relationshipCount
    `);
    const relationshipCountFinal = relResult.records[0].get("relationshipCount");

    console.log(`✅ Personas en BD: ${personCount}`);
    console.log(`✅ Relaciones en BD: ${relationshipCountFinal}\n`);

    console.log("🎉 ¡Datos de prueba ingresados exitosamente!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await session.close();
    await driver.close();
  }
};

seedData();
