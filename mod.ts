import { join } from "https://deno.land/std/path/mod.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
// ^^^ before sending data back byte-by-byte, buffers(waits), sends back (ex.): full line of data.
import { parse } from "https://deno.land/std/encoding/csv.ts";

interface Planet {
  [key: string]: string;
}

async function loadPlanetsData() {
  const path = join(".", "kepler_exoplanets_nasa.csv");

  const file = await Deno.open(path);
  const bufferedReader = new BufReader(file);
  const allExoplanets = await parse(bufferedReader, {
    header: true,
    comment: "#",
  });

  Deno.close(file.rid);

  // confirmed exoplanets:
  const confirmed = (allExoplanets as Array<Planet>).filter((planet) => {
    const planetaryRadius = Number(planet["koi_prad"]);
    const stellarMass = Number(planet["koi_smass"]);
    const stellarRadius = Number(planet["koi_srad"]);

    return planet["koi_disposition"] === "CONFIRMED" &&
      planetaryRadius > 0.5 && planetaryRadius < 1.5 &&
      stellarMass > 0.78 && stellarMass < 1.04 &&
      stellarRadius > 0.99 && stellarRadius < 1.01;
  });

  return confirmed;
}

const earthLikePlanets = await loadPlanetsData();
console.log(earthLikePlanets);
console.log(`${earthLikePlanets.length} habitable planets found.`);
