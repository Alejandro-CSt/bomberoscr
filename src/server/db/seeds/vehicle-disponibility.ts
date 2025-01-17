import type { DrizzleD1Database } from "drizzle-orm/d1";
import { vehicleDisponibility } from "../schema";
import vehicleDisponibilityStates from "./data/ObtenerEstadoDisponibilidadUnidades.json";

export default async function seedVehicleDisponibility(db: DrizzleD1Database) {
  await db.insert(vehicleDisponibility).values(
    vehicleDisponibilityStates.map((state) => ({
      id: state.IdGrupoClasificacion,
      description: state.Descripcion
    }))
  );
}
