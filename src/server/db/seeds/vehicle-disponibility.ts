import db from "@/server/db/index";
import { vehicleDisponibility } from "@/server/db/schema";
import vehicleDisponibilityStates from "@/server/db/seeds/data/ObtenerEstadoDisponibilidadUnidades.json";

export default async function seedVehicleDisponibility() {
  await db.insert(vehicleDisponibility).values(
    vehicleDisponibilityStates.map((state) => ({
      id: state.IdGrupoClasificacion,
      description: state.Descripcion
    }))
  );
}
