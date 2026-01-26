import { createSelector } from "reselect";

// Selector general para usuarios y usuarios ordenados por user_rol y despues alfabeticamente por lastname y first_name
export const selectUsers = (state) => state.users;

export const selectSortedUsers = createSelector([selectUsers], (users) => {
  return [...users].sort((a, b) => {
    if (a.user_role === b.user_role) {
        if (a.lastname === b.lastname) {
            return a.first_name.localeCompare(b.first_name);
        }
        return a.lastname.localeCompare(b.lastname);
    }
    return a.user_role - b.user_role;
  });
});

//Tarifas

export const selectAllTariffs = (state) => state.tariffs;

//Tarifas, Exceptuando Hora extra y becados

export const selectTariffs = createSelector([selectAllTariffs], (tariffs) =>
  tariffs.filter((tariff) => tariff.number_of_hours > 1)
);

//Tarifas, Hora extra

export const selectExtraHour = createSelector([selectAllTariffs], (tariffs) =>
  tariffs.find((tariff) => tariff.id == 1)
);

//Infantes

export const selectInfants = (state) => state.infants;

//Infantes activos

export const selectActivateInfants = createSelector(
  [selectInfants],
  (infants) => infants.filter((infant) => infant.current_state == 1)
);

// Selector para ordenar infantes por apellido y luego por nombre
export const selectInfantsOrderedByLastName = createSelector(
  [selectInfants],
  (infants) =>
    [...infants].sort((a, b) => {
      const lastNameComparison = a.lastname.localeCompare(b.lastname);
      return lastNameComparison !== 0
        ? lastNameComparison // Si los apellidos son distintos, ordena por apellido
        : a.first_name.localeCompare(b.first_name); // Si los apellidos son iguales, ordena por nombre
    })
);

// Selector para obtener infantes activos y ordenarlos por apellido y luego por nombre
export const selectActiveInfantsOrderedByLastName = createSelector(
  [selectActivateInfants], // Usamos el selector de infantes activos
  (activeInfants) =>
    [...activeInfants].sort((a, b) => {
      const lastNameComparison = a.lastname.localeCompare(b.lastname);
      return lastNameComparison !== 0
        ? lastNameComparison // Si los apellidos son distintos, ordena por apellido
        : a.first_name.localeCompare(b.first_name); // Si los apellidos son iguales, ordena por nombre
    })
);